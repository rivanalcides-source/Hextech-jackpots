import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

type Store = {
  session: Session | null;
  saldo: number;
  setSession: (s: Session | null) => void;
  setSaldo: (n: number) => void;
};

export const useStore = create<Store>((set) => ({
  session: null,
  saldo: 0,
  setSession: (session) => set({ session }),
  setSaldo: (saldo) => set({ saldo }),
}));