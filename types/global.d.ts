export {}

declare global {
  interface Window {
    __hexcore_cmd?: (cmd: string) => string
  }
}
