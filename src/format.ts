import * as vscode from "vscode"
import * as cp from "child_process"
import * as path from "path"
import { getConfiguration, logger, LogLevel } from "./util"
import { langId } from "./consts"

// Format-on-save with python-ly (`ly reformat`).
//
// The editor's current text is piped through python-ly *before* the save,
// so the formatted text is what gets written. (The separate LilyPond
// Formatter extension reads the file from disk instead, which overwrites
// unsaved edits.) If formatting fails, the document is saved unformatted.

const formatTimeoutMS = 1000 // VS Code allows save participants ~1.5s

let warnedAboutFailure = false

const runPythonLy = (
  text: string,
  context: vscode.ExtensionContext,
  doc: vscode.TextDocument
): Promise<string> => {
  const config = getConfiguration(doc)
  const pythonPath: string = config.formatting.pathToPython
  const useBundled: boolean = config.formatting.useBundledPythonLy
  const bundledDir = path.join(context.extensionPath, `python-ly`)

  const env: NodeJS.ProcessEnv = { ...process.env, PYTHONIOENCODING: `utf-8` }
  if (useBundled) {
    env.PYTHONPATH = [bundledDir, process.env.PYTHONPATH]
      .filter(Boolean)
      .join(path.delimiter)
  }

  return new Promise((resolve, reject) => {
    const proc = cp.spawn(pythonPath, [`-m`, `ly`, `reformat`], {
      env,
      // run from the bundle so `-m ly` never picks up a stray `ly` folder
      cwd: useBundled ? bundledDir : path.dirname(doc.uri.fsPath),
    })
    let stdout = ``
    let stderr = ``
    const timer = setTimeout(() => {
      proc.kill(`SIGKILL`)
      reject(new Error(`python-ly timed out after ${formatTimeoutMS}ms`))
    }, formatTimeoutMS)

    proc.stdout.setEncoding(`utf-8`)
    proc.stderr.setEncoding(`utf-8`)
    proc.stdout.on(`data`, (d: string) => (stdout += d))
    proc.stderr.on(`data`, (d: string) => (stderr += d))
    proc.on(`error`, (err) => {
      clearTimeout(timer)
      reject(err)
    })
    proc.on(`close`, (code) => {
      clearTimeout(timer)
      if (code === 0) {
        resolve(stdout)
      } else {
        reject(new Error(stderr.trim() || `python-ly exited with code ${code}`))
      }
    })
    proc.stdin.end(text, `utf-8`)
  })
}

const formatDocument = async (
  doc: vscode.TextDocument,
  context: vscode.ExtensionContext
): Promise<vscode.TextEdit[]> => {
  const text = doc.getText()
  try {
    const formatted = await runPythonLy(text, context, doc)
    // python-ly returns empty output for an empty file; never blank a document
    if (formatted === text || (formatted.length === 0 && text.length > 0)) {
      return []
    }
    const fullRange = new vscode.Range(
      doc.positionAt(0),
      doc.positionAt(text.length)
    )
    return [vscode.TextEdit.replace(fullRange, formatted)]
  } catch (err) {
    const msg = `Format on save skipped (file saved unformatted): ${err}`
    // show the first failure, then only log, so saving never gets noisy
    logger(msg, LogLevel.warning, warnedAboutFailure)
    warnedAboutFailure = true
    return []
  }
}

export const subscribeFormatOnSave = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.workspace.onWillSaveTextDocument((e) => {
      if (e.document.languageId !== langId) {
        return
      }
      // skip auto-save while typing, like VS Code's own formatOnSave
      if (e.reason === vscode.TextDocumentSaveReason.AfterDelay) {
        return
      }
      if (!getConfiguration(e.document).formatting.formatOnSave) {
        return
      }
      e.waitUntil(formatDocument(e.document, context))
    })
  )
}
