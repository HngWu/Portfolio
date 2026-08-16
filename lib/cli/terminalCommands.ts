import React from "react"
import { isHexcoreBridgeActive, sendHexcoreCommand } from "@/lib/hexcore/bridge"

export type OSType = "windows" | "mac" | "linux"

export interface HistoryItem {
  type: "command" | "output"
  content: string | React.ReactNode
}

export interface TerminalConfig {
  prompt: string
  cursorColor: string
  headerTitle: string
  commands: {
    list: string
    read: string
    clear: string
  }
}

export const BIO_FALLBACK = "HW - Creative Developer / Systems Architect. Specialized in high-performance web applications and immersive interfaces. Bridging the gap between engineering and aesthetic design."

export const SKILLS_FALLBACK = [
  { category: "Languages", items: ["Java", "Python", "JavaScript", "TypeScript", "Kotlin", "C#", "SQL"] },
  { category: "Frameworks", items: ["Spring Boot", "React.js", "Next.js", "Node.js"] },
  { category: "Databases", items: ["MariaDB", "MongoDB", "MSSQL", "MySQL"] }
]

export const CATEGORY_MAP: Record<string, string> = {
  "Java": "Languages",
  "TypeScript": "Languages",
  "JavaScript": "Languages",
  "Python": "Languages",
  "Kotlin": "Languages",
  "C#": "Languages",
  "SQL": "Languages",
  "Solidity": "Languages",
  "Spring Boot": "Frameworks",
  "Next.js": "Frameworks",
  "Next.js 16": "Frameworks",
  "React": "Frameworks",
  "React 19": "Frameworks",
  "React.js": "Frameworks",
  "Node.js": "Frameworks",
  "GSAP": "Frameworks",
  "Three.js": "Frameworks",
  "TailwindCSS": "Frameworks",
  "Vite": "Frameworks",
  "ethers.js": "Frameworks",
  "MariaDB": "Databases",
  "MongoDB": "Databases",
  "MSSQL": "Databases",
  "MySQL": "Databases",
  "Redis": "Databases",
  "OpenShift": "Databases",
  "Jenkins": "Databases",
  "Supabase": "Databases",
  "Gemini AI": "Databases",
}

export function detectOS(): OSType {
  if (typeof window === "undefined") return "linux"
  const ua = (window.navigator.userAgent || "").toLowerCase()
  const platform = (window.navigator.platform || "").toLowerCase()
  const userAgentDataPlatform = (
    ((window.navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform || "")
  ).toLowerCase()

  const isWin = ua.includes("win") || platform.includes("win") || userAgentDataPlatform.includes("win")
  const isMac = ua.includes("mac") || platform.includes("mac") || userAgentDataPlatform.includes("mac") || platform.includes("ipad") || platform.includes("iphone")

  if (isWin) return "windows"
  if (isMac) return "mac"
  return "linux"
}

export function getTerminalConfig(os: OSType): TerminalConfig {
  if (os === "windows") {
    return {
      prompt: "C:\\Users\\HW> ",
      cursorColor: "bg-[#cccccc]",
      headerTitle: "Command Prompt",
      commands: { list: "dir", read: "type", clear: "cls" }
    }
  }
  return {
    prompt: os === "mac" ? "hw@mac:~$ " : "hw@linux:~$ ",
    cursorColor: "bg-lume-primary",
    headerTitle: os === "mac" ? "zsh" : "bash",
    commands: { list: "ls", read: "cat", clear: "clear" }
  }
}
