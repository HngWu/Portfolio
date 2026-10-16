import { create } from "zustand"
import type { DatabaseProvider, DatabaseStatus } from "@/lib/db/types"

interface DatabaseStoreState {
  activeProvider: DatabaseProvider
  status: DatabaseStatus | null
  isLoading: boolean
  isSwitching: boolean
  dataVersion: number
  setStatus: (status: DatabaseStatus | null) => void
  setIsLoading: (loading: boolean) => void
  setIsSwitching: (switching: boolean) => void
  incrementDataVersion: () => void
}

export const useDatabaseStore = create<DatabaseStoreState>((set) => ({
  activeProvider: "sqlite",
  status: null,
  isLoading: true,
  isSwitching: false,
  dataVersion: 0,
  setStatus: (status) =>
    set({
      status,
      activeProvider: status?.activeProvider || "sqlite",
    }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsSwitching: (isSwitching) => set({ isSwitching }),
  incrementDataVersion: () =>
    set((state) => ({ dataVersion: state.dataVersion + 1 })),
}))
