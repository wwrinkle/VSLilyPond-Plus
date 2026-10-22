// PDF preview with two-way point-and-click, ported from
// lhl2617/VSLilyPond-PDF-preview 0.2.8 (MIT, see LICENSE in this folder).
import * as vscode from "vscode"
import { outputToChannel } from "./output"
import { PdfCustomProvider } from "./pdf-provider"

export const registerPdfPreview = (context: vscode.ExtensionContext) => {
  const extensionRoot = vscode.Uri.file(context.extensionPath)
  const provider = new PdfCustomProvider(extensionRoot)
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      PdfCustomProvider.viewType,
      provider,
      {
        webviewOptions: {
          enableFindWidget: false,
          retainContextWhenHidden: true,
        },
      }
    )
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vslilypondPlus.goToPDFLocationFromCursor",
      async () => {
        try {
          await provider.goToPDFLocationFromCursor()
        } catch (err) {
          vscode.window.showErrorMessage(
            `Unable to go to PDF Location from cursor: ${err}`
          )
          outputToChannel(`[ERROR]: ${err}`)
        }
      }
    )
  )
}
