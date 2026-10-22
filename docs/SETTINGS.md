# VSLilyPond Settings

### Can be accessed via `Settings (JSON)` or `Settings (UI)`

## General

### vslilypondPlus.general.pathToLilypond

Path to `lilypond` executable. Default (`lilypond`) assumes lilypond is in PATH variables. Reload required.

Type: `string`

Default value: `lilypond`

## Intellisense

### vslilypondPlus.intellisense.enabled

Displays errors as you type. Disable to improve performance. Reload required.

Type: `boolean`

Default value: `true`

## Compilation

### vslilypondPlus.compilation.compileOnSave

Compiles file upon saving. Disable to improve performance. Reload required.

Type: `boolean`

Default value: `true`

### vslilypondPlus.compilation.compileMainFileOnSave

If true, compiles main file set in `Vslilypond › Compilation › Path To Main Compilation File`, else, compiles the currently active file.

Type: `boolean`

Default value: `true`

### vslilypondPlus.compilation.additionalCommandLineArguments

Additional command line arguments supplied to `lilypond` upon compilation. Note that `--loglevel=WARNING` is predefined. Intellisense also uses these arguments.

Type: `string`

Default value: N/A

### vslilypondPlus.compilation.pathToMainCompilationFile

Relative path (from workspace folder root) of the file to compile when a document in a folder/workspace is saved. If none specified, the current active file is compiled.

Type: `string`

Default value: N/A

## MIDI Playback

### vslilypondPlus.midiPlayback.output

MIDI Device used for output. If none specified, the first valid device is used. You can use the command `VSLilyPond: MIDI Playback: Set output device` to select a device from a list.

Type: `string`

Default value: N/A

## MIDI Input

### vslilypondPlus.midiInput.input

MIDI Device used for input. If none specified, the first valid device is used. After changing, please run the `VSLilyPond: MIDI Input: Restart MIDI Input` command. You can alternatively use the command `VSLilyPond: MIDI Input: Set output device` to select a device from a list.

Type: `string`

Default value: N/A

### vslilypondPlus.midiInput.chordMode

Chord mode in music entry. Registers notes that are pressed and held together as a chord instead of sequential notes.

Type: `boolean`

Default value: `false`

### vslilypondPlus.midiInput.relativeMode

Relative mode (as opposed to absolute mode).

Type: `boolean`

Default value: `false`

### vslilypondPlus.midiInput.accidentals

Set accidentals as sharps/flats.

Type: `string`

Default value: `sharps`

## Formatting

### vslilypondPlus.formatting.formatOnSave

Reformat LilyPond files with python-ly (`ly reformat`) just before saving. The editor's current text is formatted, so unsaved edits are never lost. If formatting fails the file is saved unformatted.

Type: `boolean`

Default value: `true`

### vslilypondPlus.formatting.pathToPython

Path to the Python 3 executable used to run python-ly. Default (`python3`) assumes it is in PATH.

Type: `string`

Default value: `python3`

### vslilypondPlus.formatting.useBundledPythonLy

Use the copy of python-ly bundled with this extension. Disable to use the python-ly installed for `vslilypondPlus.formatting.pathToPython`.

Type: `boolean`

Default value: `true`