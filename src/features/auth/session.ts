/*
=============================
session
--> Kontrak konteks sesi dan hook akun yang telah masuk.
=============================
*/

import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext } from 'react';
import type { User } from './types';

export interface SessionState {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  demo: () => void;
}
export const SessionContext = createContext<SessionState | null>(null);
export function useSession() {
  const state = useContext(SessionContext);
  if (!state) throw new Error('SessionProvider diperlukan.');
  return state;
}
export function useMember() {
  const state = useSession();
  if (!state.user) throw new Error('Halaman ini memerlukan akun simulasi.');
  return { ...state, user: state.user };
}
