import { create } from "zustand"

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
}

interface ConfirmState {
  isOpen: boolean
  options: ConfirmOptions
  resolveRef: ((val: boolean) => void) | null
  confirm: (options: ConfirmOptions) => Promise<boolean>
  close: (result: boolean) => void
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  options: { title: "", message: "" },
  resolveRef: null,
  confirm: (options) => {
    return new Promise<boolean>((resolve) => {
      set({ isOpen: true, options, resolveRef: resolve })
    })
  },
  close: (result) => {
    const { resolveRef } = get()
    if (resolveRef) {
      resolveRef(result)
    }
    set({ isOpen: false, resolveRef: null })
  },
}))
