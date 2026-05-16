import * as React from "react"
import { BackLink } from "./BackLink"
import { PageHero } from "./PageHero"

interface DetailShellProps {
  typeLabel: string
  title: string
  descriptor: string
  children: React.ReactNode
}

export function DetailShell({ typeLabel, title, descriptor, children }: DetailShellProps) {
  return (
    <main className="min-h-screen pt-24 pb-24 px-4 md:px-8 max-w-4xl mx-auto">
      <BackLink />
      <PageHero typeLabel={typeLabel} title={title} descriptor={descriptor} />
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </main>
  )
}
