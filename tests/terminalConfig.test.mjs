import { describe, it, expect } from "bun:test"
import { getTerminalConfig } from "../lib/cli/terminalCommands"

describe("getTerminalConfig", () => {
  it("returns Quick Pitch header in quick mode for Windows", () => {
    const config = getTerminalConfig("windows", "quick")
    expect(config.headerTitle).toBe("✦ archive.codex — type 'help' to inspect")
    expect(config.prompt).toBe("C:\\Users\\Developer> ")
    expect(config.commands.clear).toBe("cls")
  })

  it("returns Deep Dive header in deep mode for Windows", () => {
    const config = getTerminalConfig("windows", "deep")
    expect(config.headerTitle).toBe("◆ hexgate.cli // v2.6.0 — telemetry online")
    expect(config.prompt).toBe("C:\\Users\\Developer> ")
    expect(config.commands.clear).toBe("cls")
  })

  it("returns Quick Pitch header in quick mode for Linux/Mac", () => {
    const configMac = getTerminalConfig("mac", "quick")
    expect(configMac.headerTitle).toBe("✦ archive.codex — type 'help' to inspect")

    const configLinux = getTerminalConfig("linux", "quick")
    expect(configLinux.headerTitle).toBe("✦ archive.codex — type 'help' to inspect")
  })

  it("returns Deep Dive header in deep mode for Linux/Mac", () => {
    const configMac = getTerminalConfig("mac", "deep")
    expect(configMac.headerTitle).toBe("◆ hexgate.cli // v2.6.0 — telemetry online")

    const configLinux = getTerminalConfig("linux", "deep")
    expect(configLinux.headerTitle).toBe("◆ hexgate.cli // v2.6.0 — telemetry online")
  })
})
