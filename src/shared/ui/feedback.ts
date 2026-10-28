/*
=============================
feedback
--> Kontrak dialog dan notifikasi antarmuka.
=============================
*/

import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext } from 'react';

export type Modal =
  | { type: 'stock'; id?: string }
  | { type: 'delete'; id: string }
  | { type: 'recipe' | 'swap'; d: number; s: number }
  | null;
export interface FeedbackState {
  notify: (message: string) => void;
  setModal: Dispatch<SetStateAction<Modal>>;
}
export const FeedbackContext = createContext<FeedbackState | null>(null);
export function useFeedback() {
  const state = useContext(FeedbackContext);
  if (!state) throw new Error('FeedbackProvider diperlukan.');
  return state;
}
