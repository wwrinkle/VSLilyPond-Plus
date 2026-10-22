// Prepares the PDF preview webview. Run from the repo root (npm run compile does).
// - Patches pdfjs-dist-viewer-min the way lhl2617/VSLilyPond-PDF-preview did.
// - Copies the webview stylesheet into out/.
const fs = require("fs")
const path = require("path")

const pdfjs = path.join("node_modules", "pdfjs-dist-viewer-min", "build", "minified")
const marker = path.join(pdfjs, "patched.txt")

const patch = (file, from, to) => {
  const text = fs.readFileSync(file, "utf8")
  if (!text.includes(from)) {
    throw new Error(`pdf.js patch failed: "${from}" not found in ${file}`)
  }
  fs.writeFileSync(file, text.split(from).join(to))
}

if (!fs.existsSync(marker)) {
  const viewer = path.join(pdfjs, "web", "pdf.viewer.js")
  // don't open pdf.js's sample PDF
  patch(viewer, "compressed.tracemonkey-pldi-09.pdf", "")
  // render every page, not just visible ones, so point-and-click links all register
  patch(
    viewer,
    "const s=e.scrollTop,r=s+e.clientHeight,l=e.scrollLeft,h=l+e.clientWidth;",
    "const s=0,r=e.scrollHeight,l=0,h=e.scrollWidth;"
  )
  // allow LilyPond's textedit: links
  for (const f of ["pdf.js", "pdf.worker.js"]) {
    patch(path.join(pdfjs, "build", f), `case"tel:":`, `case"tel:":case"textedit:":`)
  }
  fs.writeFileSync(marker, "")
  console.log("Patched pdf.js")
}

const outDir = path.join("out", "pdf-preview", "webview")
fs.mkdirSync(outDir, { recursive: true })
fs.copyFileSync(
  path.join("src", "pdf-preview", "webview", "pdf.css"),
  path.join(outDir, "pdf.css")
)
