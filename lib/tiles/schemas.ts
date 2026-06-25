/**
 * Typed content schemas + validators for bento tiles.
 *
 * The `tiles` table stores flexible JSONB in `content` and `deep_dive`. Every
 * consumer used to cast `content as Record<string, unknown>` then `as string`
 * per field, so a malformed row silently rendered `undefined`. This module is
 * the single typed boundary: it turns a raw JSONB blob into a typed object (or
 * a structured error) before any component touches it.
 *
 * Design:
 *  - One interface per tile `type`, matching the shapes in `lib/supabase/seed.sql`.
 *  - Lightweight runtime validators (no external deps; zod isn't in the tree).
 *    Each returns `{ ok, data }` or `{ ok: false, error }`.
 *  - `TileType` and `ContentOf` map a type string to its content shape, so the
 *    renderer and tile components stay fully typed.
 *
 * Add a new tile type here: define its `*Content` interface + validator, then
 * register both in `TILE_CONTENT` and `TILE_DEEP_DIVE` below.
 */

import type { Json } from "@/types/supabase"

export type TileType =
  | "hero"
  | "3d"
  | "project"
  | "experience"
  | "education"
  | "terminal"
  | "stat"
  | "skill"
  | "award"
  | "contact"
  | "easter_egg"
  | "config"

export type ParseResult<T> = { ok: true; data: T } | { ok: false; error: string }

// ──────────────────────────────────────────────────────────────────────────
// Field-level helpers
// ──────────────────────────────────────────────────────────────────────────

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined
}

function asStringOrFallback(v: unknown, fallback: string): string {
  return typeof v === "string" && v.length > 0 ? v : fallback
}

function asStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out: string[] = []
  for (const item of v) {
    if (typeof item === "string") out.push(item)
  }
  return out.length > 0 ? out : undefined
}

// ──────────────────────────────────────────────────────────────────────────
// Per-type content interfaces + validators
// ──────────────────────────────────────────────────────────────────────────

export interface HeroContent {
  mark: string
  role: string
  description: string
}

export interface ProjectContent {
  name: string
  description: string
  techStack: string[]
  githubUrl: string
  liveUrl: string
  featured: boolean
}

export interface ExperienceContent {
  role: string
  company: string
  date: string
  highlights: string[]
}

export interface EducationContent {
  institution: string
  degree: string
  date: string
  gpa: string
}

export interface StatContent {
  label: string
  value: string
}

export interface SkillContent {
  tags: string[]
}

export interface AwardContent {
  name: string
  issuer: string
  date: string
  desc: string
}

export interface ContactContent {
  email: string
  github: string
  linkedin: string
  telegram?: string
}

export type EmptyContent = Record<string, never>


// ──────────────────────────────────────────────────────────────────────────
// Deep-dive (back-face) shapes — currently only a few types use them.
// ──────────────────────────────────────────────────────────────────────────

export interface ExperienceDeepDive {
  highlights: string[]
}

export interface EducationDeepDive {
  gpa?: string
  date?: string
  degree?: string
  institution?: string
  honours?: string
}

export interface StatDeepDive {
  value?: string
  label?: string
}

export interface ProjectDeepDive {
  notes?: string
}

export interface ContactDeepDive {
  availability?: string
  timezone?: string
  pgpKey?: string
}

export type EmptyDeepDive = Record<string, never>

// ──────────────────────────────────────────────────────────────────────────
// Registry: type → content shape + validator
// ──────────────────────────────────────────────────────────────────────────

export interface TileContentMap {
  hero: HeroContent
  "3d": EmptyContent
  project: ProjectContent
  experience: ExperienceContent
  education: EducationContent
  terminal: EmptyContent
  stat: StatContent
  skill: SkillContent
  award: AwardContent
  contact: ContactContent
  easter_egg: EmptyContent
  config: EmptyContent
}

export interface TileDeepDiveMap {
  hero: HeroContent
  "3d": EmptyDeepDive
  project: ProjectDeepDive
  experience: ExperienceDeepDive
  education: EducationDeepDive
  terminal: EmptyDeepDive
  stat: StatDeepDive
  skill: EmptyDeepDive
  award: EmptyDeepDive
  contact: ContactDeepDive
  easter_egg: EmptyDeepDive
  config: EmptyDeepDive
}

/** Resolve the content type for a given tile type string. */
export type ContentOf<T extends TileType> = TileContentMap[T]
export type DeepDiveOf<T extends TileType> = TileDeepDiveMap[T]

// ──────────────────────────────────────────────────────────────────────────
// Validators
// ──────────────────────────────────────────────────────────────────────────

const parseHero = (raw: unknown): ParseResult<HeroContent> => {
  if (!isObject(raw)) return err("hero content must be an object")
  return ok({
    mark: asStringOrFallback(raw.mark, ""),
    role: asStringOrFallback(raw.role, ""),
    description: asStringOrFallback(raw.description, ""),
  })
}

const parseProject = (raw: unknown): ParseResult<ProjectContent> => {
  if (!isObject(raw)) return err("project content must be an object")
  return ok({
    name: asStringOrFallback(raw.name, "Untitled Project"),
    description: asStringOrFallback(raw.description, ""),
    techStack: asStringArray(raw.tech_stack) ?? [],
    githubUrl: asString(raw.github_url) ?? "",
    liveUrl: asString(raw.live_url) ?? "",
    featured: raw.featured === true,
  })
}

const parseExperience = (raw: unknown): ParseResult<ExperienceContent> => {
  if (!isObject(raw)) return err("experience content must be an object")
  return ok({
    role: asStringOrFallback(raw.role, ""),
    company: asStringOrFallback(raw.company, ""),
    date: asStringOrFallback(raw.date, ""),
    highlights: asStringArray(raw.highlights) ?? [],
  })
}

const parseEducation = (raw: unknown): ParseResult<EducationContent> => {
  if (!isObject(raw)) return err("education content must be an object")
  return ok({
    institution: asStringOrFallback(raw.institution, ""),
    degree: asStringOrFallback(raw.degree, ""),
    date: asStringOrFallback(raw.date, ""),
    gpa: asStringOrFallback(raw.gpa, ""),
  })
}

const parseStat = (raw: unknown): ParseResult<StatContent> => {
  if (!isObject(raw)) return err("stat content must be an object")
  return ok({
    label: asStringOrFallback(raw.label, ""),
    value: asStringOrFallback(raw.value, ""),
  })
}

const parseSkill = (raw: unknown): ParseResult<SkillContent> => {
  if (!isObject(raw)) return err("skill content must be an object")
  return ok({
    tags: asStringArray(raw.tags) ?? [],
  })
}

const parseAward = (raw: unknown): ParseResult<AwardContent> => {
  if (!isObject(raw)) return err("award content must be an object")
  return ok({
    name: asStringOrFallback(raw.name, ""),
    issuer: asStringOrFallback(raw.issuer, ""),
    date: asStringOrFallback(raw.date, ""),
    desc: asStringOrFallback(raw.desc, ""),
  })
}

const parseContact = (raw: unknown): ParseResult<ContactContent> => {
  if (!isObject(raw)) return err("contact content must be an object")
  const telegram = asString(raw.telegram)
  return ok({
    email: asStringOrFallback(raw.email, ""),
    github: asStringOrFallback(raw.github, ""),
    linkedin: asStringOrFallback(raw.linkedin, ""),
    ...(telegram ? { telegram } : {}),
  })
}

const parseEmpty = (): ParseResult<EmptyContent> => ok({})

/** Lenient hero parse used for the hero deep-dive payload (returns raw, not a result). */
const parseHeroRaw = (raw: unknown): HeroContent => {
  const res = parseHero(raw)
  return res.ok ? res.data : { mark: "", role: "", description: "" }
}

// ──────────────────────────────────────────────────────────────────────────
// Deep-dive validators (lenient — these are optional enhancement payloads)
// ──────────────────────────────────────────────────────────────────────────

const parseExperienceDeepDive = (raw: unknown): ExperienceDeepDive => {
  if (!isObject(raw)) return { highlights: [] }
  return { highlights: asStringArray(raw.highlights) ?? [] }
}

const parseEducationDeepDive = (raw: unknown): EducationDeepDive => {
  if (!isObject(raw)) return {}
  const honours = asString(raw.honours)
  return {
    ...(asString(raw.gpa) ? { gpa: asString(raw.gpa) } : {}),
    ...(asString(raw.date) ? { date: asString(raw.date) } : {}),
    ...(asString(raw.degree) ? { degree: asString(raw.degree) } : {}),
    ...(asString(raw.institution) ? { institution: asString(raw.institution) } : {}),
    ...(honours ? { honours } : {}),
  }
}

const parseStatDeepDive = (raw: unknown): StatDeepDive => {
  if (!isObject(raw)) return {}
  return {
    ...(asString(raw.value) ? { value: asString(raw.value) } : {}),
    ...(asString(raw.label) ? { label: asString(raw.label) } : {}),
  }
}

const parseProjectDeepDive = (raw: unknown): ProjectDeepDive => {
  if (!isObject(raw)) return {}
  const notes = asString(raw.notes)
  return notes ? { notes } : {}
}

const parseContactDeepDive = (raw: unknown): ContactDeepDive => {
  if (!isObject(raw)) return {}
  return {
    ...(asString(raw.availability) ? { availability: asString(raw.availability) } : {}),
    ...(asString(raw.timezone) ? { timezone: asString(raw.timezone) } : {}),
    ...(asString(raw.pgp_key) ? { pgpKey: asString(raw.pgp_key) } : {}),
  }
}

const parseEmptyDeepDive = (): EmptyDeepDive => ({})

// ──────────────────────────────────────────────────────────────────────────
// Registry
// ──────────────────────────────────────────────────────────────────────────

export const TILE_CONTENT = {
  hero: parseHero,
  "3d": parseEmpty,
  project: parseProject,
  experience: parseExperience,
  education: parseEducation,
  terminal: parseEmpty,
  stat: parseStat,
  skill: parseSkill,
  award: parseAward,
  contact: parseContact,
  easter_egg: parseEmpty,
  config: parseEmpty,
} as const

export const TILE_DEEP_DIVE = {
  hero: parseHeroRaw,
  "3d": parseEmptyDeepDive,
  project: parseProjectDeepDive,
  experience: parseExperienceDeepDive,
  education: parseEducationDeepDive,
  terminal: parseEmptyDeepDive,
  stat: parseStatDeepDive,
  skill: parseEmptyDeepDive,
  award: parseEmptyDeepDive,
  contact: parseContactDeepDive,
  easter_egg: parseEmptyDeepDive,
  config: parseEmptyDeepDive,
} as const

// ──────────────────────────────────────────────────────────────────────────
// Public entry points
// ──────────────────────────────────────────────────────────────────────────

/**
 * Parse a tile's front-face content into its typed shape. Unknown tile types
 * and malformed payloads yield a structured error the renderer can fall back
 * from — never an `undefined` field.
 */
export function parseTileContent<T extends TileType>(
  type: T,
  raw: Json | null | undefined
): ParseResult<ContentOf<T>> {
  if (raw === null || raw === undefined) {
    return err(`tile ${type} has no content`)
  }
  const parser = TILE_CONTENT[type] as (raw: unknown) => ParseResult<ContentOf<T>>
  return parser(raw)
}

/**
 * Parse a tile's deep-dive (back-face) payload. Deep dives are optional
 * enhancements, so this is lenient: a missing/invalid payload yields the
 * type's empty default rather than an error.
 */
export function parseTileDeepDive<T extends TileType>(
  type: T,
  raw: Json | null | undefined
): DeepDiveOf<T> {
  const parser = TILE_DEEP_DIVE[type] as (raw: unknown) => DeepDiveOf<T>
  return parser(raw ?? {})
}

// ──────────────────────────────────────────────────────────────────────────
// Internal result helpers
// ──────────────────────────────────────────────────────────────────────────

function ok<T>(data: T): ParseResult<T> {
  return { ok: true, data }
}
function err(message: string): ParseResult<never> {
  return { ok: false, error: message }
}
