"use client"

import * as React from "react"
import { usePageTransitionsStore } from "@/store/usePageTransitionsStore"
import { getPageTransitions } from "@/app/actions/page-transitions"
import type { PageTransitionRule } from "@/types/transitions"

export function PageTransitionsProvider({
  initialRules,
  children,
}: {
  initialRules?: PageTransitionRule[]
  children: React.ReactNode
}) {
  const setRules = usePageTransitionsStore((s) => s.setRules)

  React.useEffect(() => {
    if (initialRules && initialRules.length > 0) {
      setRules(initialRules)
    } else {
      getPageTransitions().then((rules) => {
        if (rules && rules.length > 0) setRules(rules)
      })
    }
  }, [initialRules, setRules])

  return <>{children}</>
}
