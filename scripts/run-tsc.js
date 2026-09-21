const path = require('path')
const ts = require(require.resolve('typescript', { paths: [path.resolve(__dirname, '..')] }))

console.log('Running TypeScript program diagnostic check...\n')
const configPath = path.resolve(__dirname, '../tsconfig.json')
const configFile = ts.readConfigFile(configPath, ts.sys.readFile)

if (configFile.error) {
  console.error('Error reading tsconfig.json:', configFile.error)
  process.exit(1)
}

const parsedCommandLine = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  path.resolve(__dirname, '..')
)

parsedCommandLine.options.incremental = false
parsedCommandLine.options.noEmit = true

const program = ts.createProgram(parsedCommandLine.fileNames, parsedCommandLine.options)
const allDiagnostics = ts.getPreEmitDiagnostics(program)

let errors = 0
allDiagnostics.forEach(diagnostic => {
  if (diagnostic.category === ts.DiagnosticCategory.Error) {
    errors++
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start)
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`)
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
    }
  }
})

if (errors > 0) {
  console.log(`\n❌ Found ${errors} TypeScript error(s).`)
  process.exit(1)
} else {
  console.log('✓ TypeScript check passed cleanly with 0 errors across the entire project!')
  process.exit(0)
}
