import { describe, it, expect } from "bun:test"
import { getTerminalConfig } from "../lib/cli/terminalCommands"

describe("getTerminalConfig", () => {
  it("keeps header title as Command Prompt for Windows", () => {
    const config = getTerminalConfig("windows")
    expect(config.headerTitle).toBe("Command Prompt")
    expect(config.prompt).toBe("C:\\Users\\Developer> ")
    expect(config.commands.clear).toBe("cls")
    expect(config.commands.list).toBe("dir")
    expect(config.commands.read).toBe("type")
  })

  it("keeps header title as bash for Linux", () => {
    const config = getTerminalConfig("linux")
    expect(config.headerTitle).toBe("bash")
    expect(config.prompt).toBe("developer@linux:~$ ")
    expect(config.commands.clear).toBe("clear")
    expect(config.commands.list).toBe("ls")
    expect(config.commands.read).toBe("cat")
  })

  it("keeps header title as zsh for Mac", () => {
    const config = getTerminalConfig("mac")
    expect(config.headerTitle).toBe("zsh")
    expect(config.prompt).toBe("developer@mac:~$ ")
    expect(config.commands.clear).toBe("clear")
  })
})
