//from: https://docs.pmnd.rs/zustand/guides/auto-generating-selectors
import type { StoreApi, UseBoundStore } from 'zustand'

/**
 * Type helper that adds a `use` property to a Zustand store, allowing for 
 * auto-generated property selectors (e.g., `store.use.count()`).
 */
type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

/**
 * Enhanced a Zustand store with auto-generated selectors for all state properties.
 * This pattern avoids manual selector definitions and improves performance 
 * by ensuring only needed state slices trigger re-renders.
 * 
 * @param {S} _store - The original Zustand store.
 * @returns {WithSelectors<S>} The store with a `use` member for automatic selections.
 * 
 * @example
 * const useMyStore = createSelectors(myStoreContext);
 * const count = useMyStore.use.count();
 */
export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S
) => {
  let store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (let k of Object.keys(store.getState())) {
    ;(store.use as any)[k] = () => store((s) => s[k as keyof typeof s])
  }

  return store
}