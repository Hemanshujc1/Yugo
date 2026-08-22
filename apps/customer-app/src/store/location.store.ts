import { create } from 'zustand';
import type { Address } from '@/types/user.types';

interface LocationState {
  selectedAddress: Address | null;
  setAddress: (address: Address) => void;
}

export const useLocationStore = create<LocationState>()((set) => ({
  selectedAddress: null,
  setAddress: (address: Address) => set({ selectedAddress: address }),
}));
