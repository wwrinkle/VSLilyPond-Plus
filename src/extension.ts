import * as vscode from "vscode"
import {
  lilypondExists,
  getConfiguration,
  getBinPath,
  setLilypondVersionInStatusBar,
} from "./util"
import { compile, CompileMode, initCompile, killCompilation } from "./lilypond"
import { subscribeIntellisense } from "./intellisense"
import { MIDIOut } from "./midi-out"
import { MIDIIn } from "./midi-in"
import { langId } from "./consts"
import { subscribeFormatOnSave } from "./format"

export function activate(context: vscode.ExtensionContext) {
  // need to make sure `lilypond` exists
  if (!lilypondExists()) {
    vscode.window.showErrorMessage(
      `\`lilypond\` (${getBinPath()}) is not found in your system.`
    )
    return
  }
  setLilypondVersionInStatusBar(context)

  const config = getConfiguration()

  // ===== ===== ===== COMPILATION ===== ===== =====
  // init
  initCompile()

  // compile main file if exists, else compiles active file
  const compileCmd = vscode.commands.registerCommand(
    "vslilypondPlus.compile",
    () => {
      compile()
    }
  )
  context.subscriptions.push(compileCmd)

  // compile to pdf
  const compileThisSpecificFileCmd = vscode.commands.registerCommand(
    "vslilypondPlus.compileThisSpecificFile",
    () => {
      compile(CompileMode.onCompileSpecific)
    }
  )
  context.subscriptions.push(compileThisSpecificFileCmd)

  const killCompilationCmd = vscode.commands.registerCommand(
    "vslilypondPlus.killCompilationProcess",
    () => {
      killCompilation(false)
    }
  )
  context.subscriptions.push(killCompilationCmd)

  // compile upon saving
  if (config.compilation.compileOnSave) {
    vscode.workspace.onDidSaveTextDocument((textDoc: vscode.TextDocument) => {
      if (textDoc.languageId === langId) {
        compile(CompileMode.onSave, true, textDoc)
      }
    })
  }

  // ===== ===== ===== FORMATTING ===== ===== =====
  // format with python-ly before saving (checks its setting on every save)
  subscribeFormatOnSave(context)

  // ===== ===== ===== INTELLISENSE ===== ===== =====
  // intellisense
  if (config.intellisense.enabled) {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection()
    subscribeIntellisense(context, diagnosticCollection)
  }

  // ===== ===== ===== MIDI PLAYBACK ===== ===== =====
  // play midi
  const playMidiCmd = vscode.commands.registerCommand(
    "vslilypondPlus.playMIDI",
    () => {
      MIDIOut.playMIDI()
    }
  )
  context.subscriptions.push(playMidiCmd)

  // play midi from
  const playMidiFromCmd = vscode.commands.registerCommand(
    "vslilypondPlus.playMIDIFrom",
    () => {
      MIDIOut.playMIDIFrom()
    }
  )
  context.subscriptions.push(playMidiFromCmd)

  // stop midi
  const stopMidiCmd = vscode.commands.registerCommand(
    "vslilypondPlus.stopMIDI",
    () => {
      MIDIOut.stopMIDI()
    }
  )
  context.subscriptions.push(stopMidiCmd)

  // pause midi
  const pauseMidiCmd = vscode.commands.registerCommand(
    "vslilypondPlus.pauseMIDI",
    () => {
      MIDIOut.pauseMIDI()
    }
  )
  context.subscriptions.push(pauseMidiCmd)

  // resume midi
  const resumeMidiCmd = vscode.commands.registerCommand(
    "vslilypondPlus.resumeMIDI",
    () => {
      MIDIOut.resumeMIDI()
    }
  )
  context.subscriptions.push(resumeMidiCmd)

  // reset midi
  const resetMIDIOutputCmd = vscode.commands.registerCommand(
    "vslilypondPlus.resetMIDIOutput",
    () => {
      MIDIOut.resetMIDI()
    }
  )
  context.subscriptions.push(resetMIDIOutputCmd)

  // set midi output device
  const setOutputMidiDeviceCmd = vscode.commands.registerCommand(
    "vslilypondPlus.setOutputMIDIDevice",
    () => {
      MIDIOut.setOutputMIDIDevice()
    }
  )
  context.subscriptions.push(setOutputMidiDeviceCmd)

  // status bar items for MIDI playback
  MIDIOut.initMIDIStatusBarItems()

  // ===== ===== ===== MIDI INPUT ===== ===== =====
  // start midi input
  const startInputMidiCmd = vscode.commands.registerCommand(
    "vslilypondPlus.startMIDIInput",
    () => {
      MIDIIn.startMIDIInput()
    }
  )
  context.subscriptions.push(startInputMidiCmd)

  // stop midi input
  const stopInputMidiCmd = vscode.commands.registerCommand(
    "vslilypondPlus.stopMIDIInput",
    () => {
      MIDIIn.stopMIDIInput()
    }
  )
  context.subscriptions.push(stopInputMidiCmd)

  // set midi input device
  const setInputMidiDeviceCmd = vscode.commands.registerCommand(
    "vslilypondPlus.setInputMIDIDevice",
    () => {
      MIDIIn.setInputMIDIDevice()
    }
  )
  context.subscriptions.push(setInputMidiDeviceCmd)

  // restart midi input
  const restartMIDIInputCmd = vscode.commands.registerCommand(
    "vslilypondPlus.restartMIDIInput",
    () => {
      MIDIIn.restartMIDIInput()
    }
  )
  context.subscriptions.push(restartMIDIInputCmd)

  // start/stop midi input with one command
  const toggleMIDIInputCmd = vscode.commands.registerCommand(
    "vslilypondPlus.toggleMIDIInput",
    () => {
      MIDIIn.toggleMIDIInput()
    }
  )
  context.subscriptions.push(toggleMIDIInputCmd)

  // switch midi input between sharps and flats
  const toggleAccidentalsCmd = vscode.commands.registerCommand(
    "vslilypondPlus.toggleMIDIInputAccidentals",
    () => {
      MIDIIn.toggleAccidentals()
    }
  )
  context.subscriptions.push(toggleAccidentalsCmd)

  // status bar items for MIDI input
  MIDIIn.initMIDIStatusBarItems()

  // ===== ===== ===== LISTENERS ===== ===== =====
  // we need to update status bar when active text editor changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  vscode.window.onDidChangeActiveTextEditor((_) => {
    MIDIIn.updateMIDIStatusBarItem()
    MIDIOut.updateMIDIStatusBarItem()
  })

  // keep the accidentals indicator in sync with settings edits
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("vslilypondPlus.midiInput")) {
        MIDIIn.updateMIDIStatusBarItem()
      }
      // apply MIDI monitor changes to running input
      const monitorChanged = [
        "midiInput.monitor",
        "midiInput.monitorOutput",
        "midiInput.monitorSynthCommand",
      ].some((s) => e.affectsConfiguration(`vslilypondPlus.${s}`))
      if (monitorChanged && MIDIIn.isActive()) {
        MIDIIn.stopMIDIInput().then(() => MIDIIn.startMIDIInput())
      }
    })
  )
}

// this method is called when your extension is deactivated
export function deactivate() {
  // stop a synth the MIDI monitor started
  MIDIIn.stopMIDIInput()
}
