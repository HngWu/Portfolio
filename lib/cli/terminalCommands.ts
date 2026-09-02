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

export const BIO_FALLBACK = "Creative Developer / Systems Architect. Specialized in high-performance web applications and immersive interfaces. Bridging the gap between engineering and aesthetic design."

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
  const nav = window.navigator as {
    userAgent?: string
    platform?: string
    userAgentData?: { platform?: string }
  }
  const ua = (nav.userAgent || "").toLowerCase()
  const platform = (nav.platform || "").toLowerCase()
  const userAgentDataPlatform = (nav.userAgentData?.platform || "").toLowerCase()

  // Match Windows robustly across Chrome, Firefox, Edge, etc.
  const isWin =
    userAgentDataPlatform === "windows" ||
    userAgentDataPlatform.includes("win") ||
    platform.startsWith("win") ||
    ua.includes("windows") ||
    ua.includes("win32") ||
    ua.includes("win64") ||
    ua.includes("wow64")

  if (isWin) return "windows"

  // Match Mac / Apple ecosystem
  const isMac =
    userAgentDataPlatform === "macos" ||
    userAgentDataPlatform.includes("mac") ||
    platform.startsWith("mac") ||
    platform.includes("iphone") ||
    platform.includes("ipad") ||
    ua.includes("macintosh") ||
    ua.includes("mac os x")

  if (isMac) return "mac"
  return "linux"
}

export function getTerminalConfig(os: OSType): TerminalConfig {
  if (os === "windows") {
    return {
      prompt: "C:\\Users\\Developer> ",
      cursorColor: "bg-[#cccccc]",
      headerTitle: "Command Prompt",
      commands: { list: "dir", read: "type", clear: "cls" }
    }
  }
  return {
    prompt: os === "mac" ? "developer@mac:~$ " : "developer@linux:~$ ",
    cursorColor: "bg-lume-primary",
    headerTitle: os === "mac" ? "zsh" : "bash",
    commands: { list: "ls", read: "cat", clear: "clear" }
  }
}
