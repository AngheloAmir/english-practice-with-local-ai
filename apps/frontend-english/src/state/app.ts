import { create } from 'zustand';
import { createSelectors } from './lib/_zustand';
import type { SoftwareModule } from './lib/_types';

interface AppState {
    currentModuleID: SoftwareModule["id"]
    setCurrentModuleID: (id: SoftwareModule["id"]) => void

    
}


const appContext = create<AppState>()((set) => ({
    currentModuleID: "0",
    setCurrentModuleID: (id) => set({ currentModuleID: id }),


}));

export const useApp = createSelectors(appContext);