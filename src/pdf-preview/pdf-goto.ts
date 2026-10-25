import * as vscode from "vscode"
import { outputToChannel } from "./output"

type CursorInfo = {
  line: number // 1-indexed (LilyPond)
  col: number
  fsPath: string
}

export class GoToPDFLocationHandler {
  private _linkRepository: Record<
    string, // VSCode Uri fsPath (LilyPond code)
    Record<
      number, // line number
      // This should be a nice ordered set for O(log n) lookups,
      // but in practice a line should not have many symbols, so O(n)
      // should be fine.
      // NOTE: This is fine--when this is populated, there is no guarantee that it comes
      // in sorted order--insertion would be O(log n) instead of O(1).
      // Insertion occurs closely after a computationally intensive state (holding the entire PDF)
      // and comes in a _large_ chunk of all notes.
      // So, let's keep this. Good and typed sorted-array stuff isn't easy to find too.
      {
        col: number
        elementID: string
        pdfFsPath: string
      }[]
    >
  > = {}

  /**
   * When a PDF is reloaded (due to recompilation) it is required to clear the links
   * from a previous compilation, if there exists any
   * @param pdfFsPath
   */
  public clearLinksForPdf = async (pdfFsPath: string) => {
    outputToChannel(`[LOG]: Clearing links for ${pdfFsPath}`)
    for (const codeFsPath in this._linkRepository) {
      for (const lineStr in this._linkRepository[codeFsPath]) {
        // https://github.com/microsoft/TypeScript/issues/32811
        const lineNum = lineStr as unknown as number
        this._linkRepository[codeFsPath][lineNum] = this._linkRepository[
          codeFsPath
        ][lineNum].filter((x) => x.pdfFsPath !== pdfFsPath)
      }
    }
    outputToChannel(`[LOG]: Links cleared for ${pdfFsPath}`)
  }

  public handleRegisterLinkMessageForPdf =
    (pdfFsPath: string) => async (msg: WebviewVSCodeRegisterLinkMessage) => {
      const { codeLocation, elementID } = msg
      const { filepath, line, col } = codeLocation
      const uri = vscode.Uri.file(filepath)
      const { fsPath } = uri
      if (!(fsPath in this._linkRepository)) {
        this._linkRepository[fsPath] = {}
      }
      if (!(line in this._linkRepository[fsPath])) {
        this._linkRepository[fsPath][line] = []
      }
      this._linkRepository[fsPath][line].push({
        col,
        elementID,
        pdfFsPath,
      })
    }

  private _getCursorInfo = (): CursorInfo => {
    const { activeTextEditor } = vscode.window
    if (!activeTextEditor) {
      throw new Error("No active text editor open.")
    }
    const { selections } = activeTextEditor
    if (selections.length !== 1) {
      throw new Error(
        "No or multiple cursor positions are present--please only place the cursor at one code location."
      )
    }
    const selection = selections[0]
    const { start } = selection
    const line0based = start.line
    const col = start.character
    const line = line0based + 1 // 1-indexed

    const { fsPath } = activeTextEditor.document.uri
    return {
      line,
      col,
      fsPath,
    }
  }

  /**
   * @param pdfRank how much to prefer a PDF: undefined if it has no open
   * preview (skip it), otherwise lower is better (e.g. 0 = visible).
   */
  public getPDFPathAndElementIDFromCursor = async (
    pdfRank: (pdfFsPath: string) => number | undefined
  ) => {
    const cursorInfo = this._getCursorInfo()
    const { fsPath, line } = cursorInfo
    const cursorCol = cursorInfo.col
    const lineLinks = this._linkRepository[fsPath]?.[line] ?? []
    if (!Object.values(this._linkRepository[fsPath] ?? {}).some((l) => l.length)) {
      throw new Error(
        "No open PDF preview has links to this file. Open the PDF (or click its tab so it loads) and try again."
      )
    }
    // Best match: open PDF with the lowest rank, then the closest element
    // at or before the cursor, else the closest one after it.
    let best:
      | { pdfFsPath: string; elementID: string; score: [number, number] }
      | undefined
    for (const { col, elementID, pdfFsPath } of lineLinks) {
      const rank = pdfRank(pdfFsPath)
      if (rank === undefined) {
        continue
      }
      const distance =
        cursorCol >= col ? cursorCol - col : 1_000_000 + (col - cursorCol)
      const score: [number, number] = [rank, distance]
      if (
        !best ||
        score[0] < best.score[0] ||
        (score[0] === best.score[0] && score[1] < best.score[1])
      ) {
        best = { pdfFsPath, elementID, score }
      }
    }
    if (best) {
      return { pdfFsPath: best.pdfFsPath, elementID: best.elementID }
    }
    throw new Error(
      "Nothing on this line links to an open PDF preview. Put the cursor on a note, chord or other printed item."
    )
  }
}
