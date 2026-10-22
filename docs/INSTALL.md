# Setup Guide

## Requirements
 
* [VSCode](https://code.visualstudio.com/) 1.44.0 minimum 
* [LilyPond](http://lilypond.org/) (Tested on 2.20.0)
* (Optional) MIDI Devices for MIDI Input and Playback

## [VSLilyPond](https://marketplace.visualstudio.com/items?itemName=lhl2617.vslilypond) Extension Setup Guide

1. Open the Extensions left panel in VSCode (Windows: Ctrl+Shift+X; MacOS: Cmd+Shift+X).
2. Type in `VsLilyPond` in the search bar.
3. Install the extension, then reload VSCode.

## [LilyPond](http://lilypond.org/) Setup Guide

1. Go to the [LilyPond Downloads page](https://lilypond.org/download.html).
2. Under "For users", choose your OS.
3. Under "Packages", download the installation package and install LilyPond.
4. [MacOS X and Windows only]
    - Option (a)
        - Follow the instructions under "Running on the command-line" to set LilyPond to run on your command line. This involves adding the `lilypond` executable to your command line.
    - Option (b)
        - Set your path to `lilypond` executable in Settings. See [vslilypond.general.pathToLilypond](SETTINGS.md#vslilypond.general.pathToLilypond).


Note: macOS Catalina (10.15) (and newer) does not support 32-bit applications--please use the 64-bit download link for LilyPond.

LilyPond Manuals and Guides can be found on [lilypond.org](http://lilypond.org).

## python-ly Setup Guide (Required for non-Windows, Linux and macOS users)

See [here](https://marketplace.visualstudio.com/items?itemName=lhl2617.lilypond-formatter).

## PDF Preview Usage Guide

The PDF preview is built into VSLilyPond Plus (it was the separate LilyPond PDF Preview extension).
Open a `.pdf` to see it; compile with `-dpoint-and-click` so clicking a note jumps to its code. If
another PDF viewer opens instead, add this to your settings:

```json
"workbench.editorAssociations": { "*.pdf": "vslilypondPlus.pdfPreview" }
```

See [the original extension](https://github.com/lhl2617/VSLilyPond-PDF-preview) for a usage guide.

