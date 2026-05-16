import { create } from 'zustand'

interface NavigationStore {
  originTileId: string | null
  setOriginTileId: (id: string | null) => void
  curtainState: 'idle' | 'covering' | 'revealing'
  setCurtainState: (state: 'idle' | 'covering' | 'revealing') => void
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  originTileId: null,
  setOriginTileId: (id) => set({ originTileId: id }),
  curtainState: 'idle',
  setCurtainState: (state) => set({ curtainState: state }),
}))
