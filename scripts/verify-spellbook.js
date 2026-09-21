/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')

console.log('=== Verifying Cyber-Grimoire Experience Spells Data Adapter ===\n')

let targetFile = path.join(__dirname, '..', 'lib', 'content', 'experienceSpells.ts')
if (!fs.existsSync(targetFile)) {
  targetFile = path.join(process.cwd(), 'lib', 'content', 'experienceSpells.ts')
}

if (!fs.existsSync(targetFile)) {
  console.error(`❌ Target file not found: ${targetFile}`)
  process.exit(1)
}

const fileContent = fs.readFileSync(targetFile, 'utf8')

// Static checks for interface and export definitions
const expectedExports = [
  'SpellIngredient',
  'SpellVerse',
  'SpellEffect',
  'SpellData',
  'HANDCRAFTED_SPELLS',
  'toSpellData'
]

for (const exp of expectedExports) {
  const hasExport = fileContent.includes(`export interface ${exp}`) ||
    fileContent.includes(`export const ${exp}`) ||
    fileContent.includes(`export function ${exp}`)

  if (!hasExport) {
    console.error(`❌ Missing export/definition for: ${exp}`)
    process.exit(1)
  }
}
console.log('✓ All interfaces and main functions/constants statically declared.')

// Transpile and evaluate TypeScript in-memory using the installed typescript package
let tsModule
try {
  const ts = require('typescript')
  const transpiled = ts.transpileModule(fileContent, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2017
    }
  }).outputText

  const mod = { exports: {} }
  const wrapper = new Function('exports', 'module', 'require', '__filename', '__dirname', transpiled)
  wrapper(mod.exports, mod, require, targetFile, path.dirname(targetFile))
  tsModule = mod.exports
} catch (err) {
  console.error('❌ Failed to transpile or evaluate experienceSpells.ts:', err)
  process.exit(1)
}

const { HANDCRAFTED_SPELLS, toSpellData } = tsModule

if (!HANDCRAFTED_SPELLS || typeof HANDCRAFTED_SPELLS !== 'object') {
  console.error('❌ HANDCRAFTED_SPELLS export is missing or invalid')
  process.exit(1)
}

// Check required spell keys for verified career roles
const requiredKeys = ['dbs-bank', 'ttp']
const actualKeys = Object.keys(HANDCRAFTED_SPELLS)

console.log(`Checking handcrafted roles: [${actualKeys.join(', ')}]`)

if (actualKeys.length !== 2) {
  console.error(`❌ Expected exactly 2 handcrafted roles, found: ${actualKeys.length}`)
  process.exit(1)
}

for (const reqKey of requiredKeys) {
  if (!HANDCRAFTED_SPELLS[reqKey]) {
    console.error(`❌ Missing handcrafted role record for key: ${reqKey}`)
    process.exit(1)
  }
}

const validSigils = new Set(['conjuration', 'transmutation', 'alchemy', 'enchantment'])

for (const key of requiredKeys) {
  const spell = HANDCRAFTED_SPELLS[key]
  
  if (!spell.spellName || typeof spell.spellName !== 'string') {
    console.error(`❌ Spell ${key} missing spellName`)
    process.exit(1)
  }
  if (!spell.realm || typeof spell.realm !== 'string') {
    console.error(`❌ Spell ${key} missing realm`)
    process.exit(1)
  }
  if (!spell.era || typeof spell.era !== 'string') {
    console.error(`❌ Spell ${key} missing era`)
    process.exit(1)
  }
  if (!spell.school || typeof spell.school !== 'string') {
    console.error(`❌ Spell ${key} missing school`)
    process.exit(1)
  }
  if (!spell.tier || typeof spell.tier !== 'string') {
    console.error(`❌ Spell ${key} missing tier`)
    process.exit(1)
  }
  if (!spell.sigilType || !validSigils.has(spell.sigilType)) {
    console.error(`❌ Spell ${key} has invalid sigilType: ${spell.sigilType}`)
    process.exit(1)
  }
  if (!Array.isArray(spell.ingredients) || spell.ingredients.length === 0) {
    console.error(`❌ Spell ${key} has empty or missing ingredients`)
    process.exit(1)
  }
  for (const ing of spell.ingredients) {
    if (!ing.name || typeof ing.category !== 'string' || ing.category.trim() === '') {
      console.error(`❌ Spell ${key} has invalid ingredient/skill:`, ing)
      process.exit(1)
    }
  }
  if (!Array.isArray(spell.incantation) || spell.incantation.length === 0) {
    console.error(`❌ Spell ${key} has empty or missing incantation/responsibilities`)
    process.exit(1)
  }
  for (const inc of spell.incantation) {
    if (!inc.lead || !inc.verse) {
      console.error(`❌ Spell ${key} has invalid responsibility item:`, inc)
      process.exit(1)
    }
  }
  if (!Array.isArray(spell.effects) || spell.effects.length === 0) {
    console.error(`❌ Spell ${key} has empty or missing outcomes/effects`)
    process.exit(1)
  }
  for (const eff of spell.effects) {
    if (!eff.rune || !eff.outcome) {
      console.error(`❌ Spell ${key} has invalid effect:`, eff)
      process.exit(1)
    }
  }
  console.log(`✓ Validated handcrafted role: "${spell.spellName}" (${key})`)
}

// Validate toSpellData adapter function
if (typeof toSpellData !== 'function') {
  console.error('❌ toSpellData is not a function')
  process.exit(1)
}

// 1. Test handcrafted lookup by company/id for DBS Bank
const dbsMock = {
  id: 'dbs-bank',
  role: 'Software Engineer Intern',
  company: 'DBS Bank',
  date: 'Apr 2025 - Mar 2026',
  highlights: ['Led full-stack system migrations']
}
const dbsSpell = toSpellData(dbsMock, 0, 5)
if (dbsSpell.spellName !== 'Software Engineer Intern' || dbsSpell.sigilType !== 'transmutation') {
  console.error('❌ toSpellData failed to map DBS Bank handcrafted record:', dbsSpell)
  process.exit(1)
}
console.log('✓ toSpellData correctly maps handcrafted experience (DBS Bank)')

// 2. Test handcrafted lookup by company/id for TTP
const ttpMock = {
  id: 'ttp-support',
  role: 'Junior IT Application Support Engineer',
  company: 'To The Point Pte Ltd (TTP)',
  date: 'Sep 2024 - Present',
  highlights: ['Executed end-to-end UAT and SIT testing cycles']
}
const ttpSpell = toSpellData(ttpMock, 1, 5)
if (ttpSpell.spellName !== 'Junior IT Application Support Engineer' || !ttpSpell.ingredients.some(i => i.name.includes('UAT'))) {
  console.error('❌ toSpellData failed to map TTP handcrafted record:', ttpSpell)
  process.exit(1)
}
console.log('✓ toSpellData correctly maps handcrafted experience (To The Point Pte Ltd / TTP)')

// 3. Test fallback dynamic mapping
const dynamicMock = {
  id: 'exp-99',
  role: 'Cloud Architect',
  company: 'Quantum Matrix',
  date: '2024 - 2025',
  highlights: [
    'Architected high-scale PostgreSQL database cluster',
    'Deployed containerized Python and Docker microservices'
  ],
  deepDiveHighlights: [
    'Scaled throughput to 10k RPS with sub-50ms latency'
  ]
}
const dynamicSpell = toSpellData(dynamicMock, 2, 5)
if (!dynamicSpell.spellName.includes('Cloud Architect') || !dynamicSpell.ingredients.some(i => i.name === 'PostgreSQL' || i.name === 'Python')) {
  console.error('❌ toSpellData failed to derive dynamic attributes:', dynamicSpell)
  process.exit(1)
}
if (!dynamicSpell.effects || dynamicSpell.effects.length === 0 || !dynamicSpell.effects[0].rune) {
  console.error('❌ toSpellData failed to derive outcomes for dynamic experience:', dynamicSpell)
  process.exit(1)
}
console.log('✓ toSpellData correctly derives dynamic attributes for unmapped experience')

console.log('\n✨ All 2 verified experience checks and adapter tests passed successfully!')
process.exit(0)
