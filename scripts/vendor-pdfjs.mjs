import fs from "node:fs"
import path from "node:path"
import https from "node:https"

const PDFJS_VERSION = "3.11.174"
const TARGET_DIR = path.resolve(process.cwd(), "public", "assets", "pdfjs")

const FILES = [
  {
    name: "pdf.min.js",
    url: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`,
  },
  {
    name: "pdf.worker.min.js",
    url: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`,
  },
]

fs.mkdirSync(TARGET_DIR, { recursive: true })

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadFile(res.headers.location, dest).then(resolve).catch(reject)
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: status code ${res.statusCode}`))
          return
        }
        res.pipe(file)
        file.on("finish", () => {
          file.close(resolve)
        })
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {})
        reject(err)
      })
  })
}

async function main() {
  console.log(`Vendoring PDF.js v${PDFJS_VERSION} into ${TARGET_DIR}...`)
  for (const f of FILES) {
    const dest = path.join(TARGET_DIR, f.name)
    console.log(`Downloading ${f.name}...`)
    await downloadFile(f.url, dest)
    const stats = fs.statSync(dest)
    console.log(`Saved ${f.name} (${(stats.size / 1024).toFixed(1)} KB)`)
  }
  console.log("PDF.js vendoring complete!")
}

main().catch((err) => {
  console.error("Vendoring failed:", err)
  process.exit(1)
})
