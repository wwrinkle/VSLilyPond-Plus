import * as cp from "child_process"
import { logger, LogLevel, getConfiguration } from "./util"
import * as JZZ from "jzz"

// Plays what you play on the MIDI keyboard through a synth while MIDI input
// is running, by forwarding the input port to a MIDI output port.
export namespace MIDIMonitor {
  // used when `midiInput.monitorOutput` and `midiPlayback.output` are empty:
  // FluidSynth's port is "Synth input port (<pid>:0)", TiMidity's "TiMidity port 0"
  const knownSynthPort = /synth input port|fluid|timidity/i

  const synthStartTimeoutMs = 10000

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let midiOutPort: any = undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let connectedInPort: any = undefined
  // synth started by `midiInput.monitorSynthCommand`
  let synthProcess: cp.ChildProcess | undefined = undefined
  // bumped on every start/stop so a slow start can tell it was cancelled
  let session = 0

  const getOutputNames = async (): Promise<string[]> => {
    await JZZ().refresh()
    return (
      JZZ()
        .info()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .outputs.map((x: any) => x.name as string)
    )
  }

  // exact name first, then a case-insensitive substring, so a setting like
  // "Synth input port" still matches after the synth restarts with a new pid
  const findPort = (names: string[], wanted: string): string | undefined => {
    if (wanted.length) {
      return (
        names.find((n) => n === wanted) ??
        names.find((n) => n.toLowerCase().includes(wanted.toLowerCase()))
      )
    }
    return names.find((n) => knownSynthPort.test(n))
  }

  const getWantedPort = (): string => {
    const config = getConfiguration()
    const monitorOutput: string = config.midiInput.monitorOutput ?? ``
    return monitorOutput.length ? monitorOutput : config.midiPlayback.output
  }

  const launchSynth = (command: string) => {
    let stderr = ``
    // own process group, so stopping it also stops anything the shell started
    const proc = cp.spawn(command, {
      shell: true,
      detached: process.platform !== `win32`,
      stdio: [`ignore`, `ignore`, `pipe`],
    })
    proc.stderr?.on(`data`, (d) => {
      stderr = (stderr + d.toString()).slice(-2000)
    })
    proc.on(`error`, (err) => {
      logger(`Could not start synth: ${err}`, LogLevel.error, false)
    })
    proc.on(`exit`, (code) => {
      if (synthProcess === proc) {
        synthProcess = undefined
        logger(
          `Synth exited (code ${code}).${stderr ? ` ${stderr.trim()}` : ``}`,
          LogLevel.warning,
          false
        )
      }
    })
    synthProcess = proc
  }

  const killSynth = () => {
    const proc = synthProcess
    synthProcess = undefined
    if (!proc || proc.exitCode !== null || proc.pid === undefined) {
      return
    }
    try {
      if (process.platform === `win32`) {
        proc.kill()
      } else {
        process.kill(-proc.pid, `SIGTERM`)
      }
    } catch (err) {
      logger(`Could not stop synth: ${err}`, LogLevel.warning, true)
    }
  }

  const waitForPort = async (
    wanted: string,
    mySession: number
  ): Promise<string | undefined> => {
    const deadline = Date.now() + synthStartTimeoutMs
    while (Date.now() < deadline && mySession === session && synthProcess) {
      await new Promise((resolve) => setTimeout(resolve, 250))
      const name = findPort(await getOutputNames(), wanted)
      if (name) {
        return name
      }
    }
    return undefined
  }

  // start forwarding `midiInPort` to the monitor synth, if monitoring is on
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const start = async (midiInPort: any) => {
    const mySession = ++session
    const config = getConfiguration()
    if (!config.midiInput.monitor) {
      return
    }
    try {
      const wanted = getWantedPort()
      let name = findPort(await getOutputNames(), wanted)

      const command: string = config.midiInput.monitorSynthCommand ?? ``
      if (!name && command.length) {
        if (!synthProcess) {
          launchSynth(command)
        }
        name = await waitForPort(wanted, mySession)
      }
      if (mySession !== session) {
        return // MIDI input was stopped while we were starting
      }
      if (!name) {
        throw new Error(
          wanted.length
            ? `MIDI monitor: no MIDI output matching "${wanted}" was found.`
            : `MIDI monitor: no synth MIDI output (FluidSynth/TiMidity) was found. Start a synth, or set \`vslilypondPlus.midiInput.monitorSynthCommand\`.`
        )
      }

      const out = await JZZ().openMidiOut(name)
      if (mySession !== session) {
        out.close()
        return
      }
      midiOutPort = out
      connectedInPort = midiInPort
      midiInPort.connect(out)
      logger(`MIDI monitor: playing through ${name}`, LogLevel.info, true)
    } catch (err) {
      logger(String(err), LogLevel.error, false)
    }
  }

  // stop forwarding; silence anything still sounding. The synth we started is
  // stopped too, unless `keepSynth` (used when MIDI input is just restarting)
  export const stop = (keepSynth = false) => {
    session++
    if (midiOutPort) {
      try {
        if (connectedInPort) {
          connectedInPort.disconnect(midiOutPort)
        }
        for (let ch = 0; ch < 16; ch++) {
          midiOutPort.send([0xb0 + ch, 64, 0]) // sustain pedal off
          midiOutPort.send([0xb0 + ch, 123, 0]) // all notes off
        }
        midiOutPort.close()
      } catch (err) {
        logger(`MIDI monitor: ${err}`, LogLevel.warning, true)
      }
    }
    midiOutPort = undefined
    connectedInPort = undefined
    if (!keepSynth) {
      killSynth()
    }
  }
}
