"use client"

import * as React from "react"
import { HeroTile } from "@/components/bento/tiles/HeroTile"
import { ProjectTile } from "@/components/bento/tiles/ProjectTile"
import { ExperienceTile } from "@/components/bento/tiles/ExperienceTile"
import { EducationTile } from "@/components/bento/tiles/EducationTile"
import { AwardTile } from "@/components/bento/tiles/AwardTile"
import { StatTile } from "@/components/bento/tiles/StatTile"
import { SkillsTile } from "@/components/bento/tiles/SkillsTile"
import { ContactTile } from "@/components/bento/tiles/ContactTile"
import { Hero3DTile } from "@/components/bento/tiles/Hero3DTile"
import { TerminalTile } from "@/components/bento/tiles/TerminalTile"
import { EasterEggTile } from "@/components/bento/tiles/EasterEggTile"
import { TileError } from "@/components/bento/TileError"
import { Database } from "@/types/supabase"
import { parseTileContent } from "@/lib/tiles/schemas"

type Tile = Database["public"]["Tables"]["tiles"]["Row"]

interface TileRendererProps {
  tile: Tile
  isDragging?: boolean
  sortableProps?: Record<string, unknown>
  allTiles?: Tile[]
}

/**
 * Pure router: turns a raw tile row into a typed tile component.
 *
 * Content is parsed through `lib/tiles/schemas` so every tile receives a
 * correctly-typed payload (or, on a malformed row, a `<TileError>` fallback
 * that keeps the grid intact instead of rendering `undefined` fields). Each
 * tile type lives in its own component under `components/bento/tiles/`.
 */
export function TileRenderer({ tile, isDragging, sortableProps, allTiles }: TileRendererProps) {

  const common = {
    id: tile.id,
    size: tile.size,
    isDragging,
    sortableProps,
  }

  switch (tile.type) {
    case "hero": {
      const parsed = parseTileContent("hero", tile.content)
      if (!parsed.ok) return <TileError id={tile.id} size={tile.size} type="hero" message={parsed.error} />
      return <HeroTile key={tile.id} {...common} content={parsed.data} />
    }
    case "3d":
      return <Hero3DTile key={tile.id} {...common} />
    case "project": {
      const parsed = parseTileContent("project", tile.content)
      if (!parsed.ok) return <TileError id={tile.id} size={tile.size} type="project" message={parsed.error} />
      return <ProjectTile key={tile.id} {...common} content={parsed.data} deepDive={tile.deep_dive} />
    }
    case "experience": {
      const parsed = parseTileContent("experience", tile.content)
      if (!parsed.ok) return <TileError id={tile.id} size={tile.size} type="experience" message={parsed.error} />
      return <ExperienceTile key={tile.id} {...common} content={parsed.data} deepDive={tile.deep_dive} />
    }
    case "education": {
      const parsed = parseTileContent("education", tile.content)
      if (!parsed.ok) return <TileError id={tile.id} size={tile.size} type="education" message={parsed.error} />
      return <EducationTile key={tile.id} {...common} content={parsed.data} deepDive={tile.deep_dive} />
    }
    case "award": {
      const parsed = parseTileContent("award", tile.content)
      if (!parsed.ok) return <TileError id={tile.id} size={tile.size} type="award" message={parsed.error} />
      return <AwardTile key={tile.id} {...common} content={parsed.data} />
    }
    case "stat": {
      const parsed = parseTileContent("stat", tile.content)
      if (!parsed.ok) return <TileError id={tile.id} size={tile.size} type="stat" message={parsed.error} />
      return <StatTile key={tile.id} {...common} content={parsed.data} deepDive={tile.deep_dive} />
    }
    case "skill": {
      const parsed = parseTileContent("skill", tile.content)
      if (!parsed.ok) return <TileError id={tile.id} size={tile.size} type="skill" message={parsed.error} />
      return <SkillsTile key={tile.id} {...common} content={parsed.data} />
    }
    case "contact": {
      const parsed = parseTileContent("contact", tile.content)
      if (!parsed.ok) return <TileError id={tile.id} size={tile.size} type="contact" message={parsed.error} />
      return <ContactTile key={tile.id} {...common} content={parsed.data} deepDive={tile.deep_dive} />
    }
    case "terminal": {
      const heroTile = allTiles?.find(t => t.type === "hero")
      const parsedHero = heroTile ? parseTileContent("hero", heroTile.content) : null
      const bio = parsedHero?.ok ? parsedHero.data.description : undefined

      const skillTile = allTiles?.find(t => t.type === "skill")
      const parsedSkill = skillTile ? parseTileContent("skill", skillTile.content) : null
      const skillsTags = parsedSkill?.ok ? parsedSkill.data.tags : undefined

      const projectTiles = allTiles?.filter(t => t.type === "project") ?? []
      const projects = projectTiles.map(p => {
        const parsed = parseTileContent("project", p.content)
        return parsed.ok ? {
          name: parsed.data.name,
          slug: parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, ""),
          description: parsed.data.description,
        } : null
      }).filter((p): p is NonNullable<typeof p> => p !== null)

      return <TerminalTile key={tile.id} {...common} bio={bio} skillsTags={skillsTags} projects={projects} />
    }
    case "easter_egg":
      return <EasterEggTile key={tile.id} isDragging={isDragging} sortableProps={sortableProps} />
    case "config":
      // Config rows are non-display metadata; never rendered on the grid.
      return null
    default:
      // Unknown tile type — render nothing rather than crash the grid.
      return null
  }
}
