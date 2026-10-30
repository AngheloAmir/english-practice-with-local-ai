import { create } from 'zustand';
import { createSelectors } from '../lib/_zustand';

interface AppState {
    currentModule: string
    setCurrentModule: (module: string) => void
    isDrawerOpen: boolean
    setIsDrawerOpen: (open: boolean) => void
    toggleDrawer: () => void
}

const appContext = create<AppState>()((set) => ({
    currentModule: "dashboard",
    setCurrentModule: (module) => set({ currentModule: module }),
    isDrawerOpen: false,
    setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),
    toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
}));

export const useApp = createSelectors(appContext);