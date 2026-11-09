declare module 'bun:test' {
  export function describe(name: string, fn: () => void): void
  export function it(name: string, fn: () => void | Promise<void>): void
  export function expect(val: any): any
  export const mock: {
    (fn: any): any
    module: (specifier: string, callback: () => any) => void
  }
}
