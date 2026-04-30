import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { eventFiltersStorageKey, initialEventFiltersState } from './constants.ts'
import type { EventFiltersStore } from './types.ts'

export const useEventFiltersStore = create<EventFiltersStore>()(
  persist(
    (set) => ({
      ...initialEventFiltersState,
      setSearch: (search) => set({ search }),
      setStatus: (status) => set({ status }),
      setStartDate: (startDate) => set({ startDate }),
      setEndDate: (endDate) => set({ endDate }),
      setMinParticipants: (minParticipants) => set({ minParticipants }),
      setMaxParticipants: (maxParticipants) => set({ maxParticipants }),
      reset: () => set(initialEventFiltersState),
    }),
    {
      name: eventFiltersStorageKey,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
