/**
 * Typed helpers for bridging communication between the Terminal and Hexcore (3D canvas).
 */

export type HexcoreCommand =
  | "ignite"
  | "ignite on"
  | "ignite off"
  | "shatter"
  | "pulse"
  | "reset"
  | "lockdown"
  | `antigravity ${string}`
  | `lightning ${string}`

/**
 * Checks if the Hexcore bridge is active on the window object.
 */
export function isHexcoreBridgeActive(): boolean {
  return typeof window !== "undefined" && typeof window.__hexcore_cmd === "function"
}

/**
 * Executes a command on the Hexcore 3D canvas via the window bridge.
 * Returns the response message from Hexcore, or a fallback message if offline.
 */
export function sendHexcoreCommand(command: string): string {
  if (typeof window === "undefined") {
    return "Hexcore telemetry offline (non-browser context)."
  }
  if (typeof window.__hexcore_cmd !== "function") {
    return "Hexcore telemetry link offline. Cannot execute command."
  }
  return window.__hexcore_cmd(command)
}
