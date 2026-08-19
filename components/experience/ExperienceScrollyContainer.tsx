"use client"

import * as React from "react"
import { ExperienceChapter } from "./ExperienceChapter"
import { ExperienceScrollyRail } from "./ExperienceScrollyRail"
import type { ParsedExperience } from "@/lib/content/portfolio"

interface ExperienceScrollyContainerProps {
  experienceList: ParsedExperience[]
}

export function ExperienceScrollyContainer({ experienceList }: ExperienceScrollyContainerProps) {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  // IntersectionObserver to update active chapter index on scroll
  React.useEffect(() => {
    const chapters = containerRef.current?.querySelectorAll("[data-chapter-index]")
    if (!chapters || chapters.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-chapter-index"))
            if (!isNaN(index)) {
              setActiveIndex(index)
            }
          }
        })
      },
      { threshold: 0.5 }
    )

    chapters.forEach((ch) => observer.observe(ch))
    return () => observer.disconnect()
  }, [experienceList])

  const handleSelectChapter = (index: number) => {
    const targetEl = document.getElementById(`experience-chapter-${index}`)
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const companies = experienceList.map((e) => e.company)

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Sticky Scrollytelling HUD Rail */}
      <ExperienceScrollyRail
        totalChapters={experienceList.length}
        activeIndex={activeIndex}
        onSelectChapter={handleSelectChapter}
        companies={companies}
      />

      {/* Chapters Stream */}
      <div className="flex flex-col">
        {experienceList.map((exp, idx) => (
          <ExperienceChapter key={exp.id || idx} experience={exp} index={idx} total={experienceList.length} />
        ))}
      </div>
    </div>
  )
}
