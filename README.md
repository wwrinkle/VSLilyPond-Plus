# VSLilyPond Plus

A fork of [VSLilyPond](https://github.com/lhl2617/VSLilyPond) by [lhl2617](https://github.com/lhl2617)
(last released as 1.7.3), with these changes:

- **Format on save, built in.** The editor's current text is reformatted with python-ly before it is
  saved, so unsaved edits are never lost. python-ly is bundled (needs only `python3`); the separate
  LilyPond Formatter extension is no longer required.
- **English note names for MIDI input** (`cs`, `bf`, ...), for files using `\language "english"`.
  Dutch (`cis`, `bes`) stays the default; set `"vslilypondPlus.midiInput.noteNames": "english"` to switch.
- **Toggle sharps/flats** with `Ctrl+Alt+A` or by clicking the new ♭/♯ status bar item. MIDI input
  restarts automatically so the change applies to the next note.
- **Start/stop MIDI input** with `Ctrl+Alt+R`.
- **Hear what you enter.** With `"vslilypondPlus.midiInput.monitor": true`, notes played during MIDI
  input are also sent to a synth (FluidSynth/TiMidity found automatically, or set
  `vslilypondPlus.midiInput.monitorOutput`). Only while input is running. To have the extension
  start and stop the synth itself, set `vslilypondPlus.midiInput.monitorSynthCommand`, e.g.
  `fluidsynth -is -a pulseaudio -m alsa_seq -z 64 -c 2 /usr/share/sounds/sf2/FluidR3_GM.sf2`.
- **No stray `-.pdf` files.** The as-you-type error check no longer writes a PDF with LilyPond 2.26.
- **PDF preview built in.** The [LilyPond PDF Preview](https://github.com/lhl2617/VSLilyPond-PDF-preview)
  extension (two-way point-and-click) is now part of this one, and it refreshes after every compile
  with LilyPond 2.26. Settings are under `vslilypondPlus.pdfPreview.*`; to make it the PDF viewer, set
  `"workbench.editorAssociations": { "*.pdf": "vslilypondPlus.pdfPreview" }`.

Commands and settings use the `vslilypondPlus.` prefix (instead of `vslilypond.`), so this fork and
the original never clash.

### Install

Download the `.vsix` from the [latest release](https://github.com/wwrinkle/VSLilyPond-Plus/releases/latest), then:

```
code --install-extension vslilypond-plus-<version>.vsix
```

Uninstall the original VSLilyPond (`lhl2617.vslilypond`) and LilyPond PDF Preview
(`lhl2617.lilypond-pdf-preview`) first. To build it yourself:
`npm ci --legacy-peer-deps && npx vsce package`.

---

*Original README follows.*

Provides syntax and error highlighting, IntelliSense and AutoComplete, compilation on save, MIDI (input and playback) support for [LilyPond](http://lilypond.org/) in VSCode. Works with any VSCode supported PDF previewer for PDF preview.

See [docs/INSTALL.md](docs/INSTALL.md) for a setup guide.

## Features

### Error highlighting 📜 
![Error highlighting](./docs/assets/gifs/syntaxHighlighting.gif)

### IntelliSense and AutoComplete 💡
![IntelliSense and AutoComplete](./docs/assets/gifs/intellisense.gif)

### Compilation on save 💾
![Compilation on save](./docs/assets/gifs/compileSave.gif)

### MIDI Input 🎹
![MIDI Input](./docs/assets/gifs/midiInput.gif)
Supports chord mode, relative mode and sharp/flat accidentals. See [DEMOS.md](./docs/DEMOS.md) for advanced features in action, and [SETTINGS.md](./docs/SETTINGS.md) on how to toggle them.

### MIDI Playback 🎼

![MIDI Playback](./docs/assets/gifs/midiPlayback.gif)

### Two-way Point and Click 📄

#### Forward (Score to PDF)
![Forward Point-and-Click](./docs/assets/gifs/point-and-click-forward.gif)

#### Backward (PDF to Score)
![Backward Point-and-Click](./docs/assets/gifs/point-and-click-backward.gif)

See [here](https://github.com/lhl2617/VSLilyPond-PDF-preview) for more information (including a usage guide).
In VSLilyPond Plus this preview is built in (MIT licensed, see `src/pdf-preview/LICENSE`).

## Requirements

See [docs/INSTALL.md](docs/INSTALL.md) for a setup guide.

* [VSCode](https://code.visualstudio.com/) 1.46.0 minimum
* [LilyPond](http://lilypond.org/) (Tested on 2.22.1)
* (Optional) MIDI Devices for MIDI Input and Playback
* (Optional for Windows, Linux and macOS users) [python-ly](https://pypi.org/project/python-ly/): Required for formatting (more information [here](https://marketplace.visualstudio.com/items?itemName=lhl2617.lilypond-formatter))

## Extension Controls, Commands and Settings

* Commands: See [docs/COMMANDS.md](docs/COMMANDS.md)
* Settings: See [docs/SETTINGS.md](docs/SETTINGS.md)
* Status Bar interface: See [docs/STATUSBAR.md](docs/STATUSBAR.md)

## Issues & FAQ

Please submit issues in the [GitHub repository](https://github.com/lhl2617/VSLilyPond).

See the FAQ at [docs/FAQ.md](docs/FAQ.md).

## Contributing

* File bugs and/or feature requests in the [GitHub repository](https://github.com/lhl2617/VSLilyPond)
* Pull requests are welcome in the [GitHub repository](https://github.com/lhl2617/VSLilyPond)
* Buy me a Coffee ☕️ via [PayPal](https://paypal.me/lhl2617)

## Development

#### Requirements

- [VSCode](https://code.visualstudio.com/)
- `npm`

#### Setup

- Clone repository
  ```bash
  git clone https://github.com/lhl2617/VSLilyPond
  ```
- Install `npm` dependencies
  ```bash
  npm i
  ```
- Hit `F5` to run an Extension Development Host.

  See [here](https://code.visualstudio.com/api/get-started/your-first-extension) for a detailed extension development guide.

#### Testing MIDI input
- On Windows, download VMPK and loopMIDI. These will allow you to test with a virtual MIDI keyboard.

#### Releasing

Releasing is done automatically via GitHub Actions. Bump the version in `package.json` and update `CHANGELOG.md` before merging into the default branch.

## Acknowledgements
Base syntax highlighting depends on the [LilyPond Syntax extension](https://marketplace.visualstudio.com/items?itemName=jeandeaual.lilypond-syntax) by [Alexis Jeandeau](https://github.com/jeandeaual), under the Creative Commons Attribution-NonCommercial 3.0 Unported (CC BY-NC 3.0) license (http://creativecommons.org/licenses/by-sa/3.0/). See that repository for additional acknowledgements.

IntelliSense and AutoComplete depends on the [LilyPond AutoComplete (Commands & Keywords) extension](https://marketplace.visualstudio.com/items?itemName=lhl2617.lilypond-snippets),
under the [MIT license](https://github.com/lhl2617/VSLilyPond-snippets/blob/master/LICENSE).

Formatting depends on the [LilyPond Formatter extension](https://marketplace.visualstudio.com/items?itemName=lhl2617.lilypond-formatter),
under the [MIT license](https://github.com/lhl2617/VSLilyPond-formatter/blob/master/LICENSE).

Point and Click depends on the [LilyPond PDF Preview extension](https://marketplace.visualstudio.com/items?itemName=lhl2617.lilypond-pdf-preview),
under the [MIT license](https://github.com/lhl2617/VSLilyPond-PDF-preview/blob/master/LICENSE).

License: Creative Commons Attribution-NonCommercial 3.0 Unported (CC BY-NC 3.0) license, http://creativecommons.org/licenses/by-sa/3.0/.

Formatting in VSLilyPond Plus uses a bundled, unmodified copy of [python-ly](https://github.com/frescobaldi/python-ly)
0.9.7 (in `python-ly/`), under the GNU General Public License v2 or later; see `python-ly/COPYING`.
It is run as a separate process. Changes in this fork are offered under the same license as VSLilyPond above.
