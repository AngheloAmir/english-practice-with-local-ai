import { create } from 'zustand';
import { createSelectors } from '../lib/_zustand';
import { MODULESCOREMOCKDATA, type ModuleScore } from './_types';

interface AppState {
    //Navigation Related===============================================
    currentModule: string;
    setCurrentModule: (module: string) => void;
    isDrawerOpen: boolean;
    setIsDrawerOpen: (open: boolean) => void;
    toggleDrawer: () => void;

    //dashboardstats===================================================
    modulescores: Array<ModuleScore>;
    loadmodulescores: () => void;
    updatemodulescores: (modules: ModuleScore[]) => void;
}

const appContext = create<AppState>()((set) => ({
    currentModule: "dashboard",
    setCurrentModule: (module) => set({ currentModule: module }),
    isDrawerOpen: false,
    setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),
    toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

    //dashboardstats===================================================
    modulescores: MODULESCOREMOCKDATA,
    loadmodulescores: () => set({ modulescores: MODULESCOREMOCKDATA }),
    updatemodulescores: (module: ModuleScore[]) => set({ modulescores: module }),
}));

export const useApp = createSelectors(appContext);
