import * as React from "react"
import { BackLink } from "./BackLink"
import { PageHero } from "./PageHero"
import { useGsap } from "@/hooks/useGsap"
import gsap from "gsap"

interface DetailShellProps {
  typeLabel: string
  title: string
  descriptor: string
  children: React.ReactNode
}

export function DetailShell({ typeLabel, title, descriptor, children }: DetailShellProps) {
  useGsap(() => {
    gsap.from(".reveal-item", {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "expo.out"
    })
  })

  return (
    <main className="min-h-screen pt-24 pb-24 px-4 md:px-8 max-w-4xl mx-auto">
      <BackLink />
      <PageHero typeLabel={typeLabel} title={title} descriptor={descriptor} />
      <div className="flex flex-col gap-6">
        {React.Children.map(children, (child) => (
          <div className="reveal-item">
            {child}
          </div>
        ))}
      </div>
    </main>
  )
}
