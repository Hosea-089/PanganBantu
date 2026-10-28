/*
=============================
planning
--> Kontrak konteks perencanaan yang dipakai wizard dan halaman hasil.
=============================
*/

import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext } from 'react';
import type { GenerationResult, Plan, PlanForm } from './types';

export interface PlanningState {
  form: PlanForm;
  setForm: Dispatch<SetStateAction<PlanForm>>;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  failure: GenerationResult | null;
  busy: boolean;
  startPlan: () => void;
  createPlan: () => void;
  savePlan: (plan: Plan) => void;
}
export const PlanningContext = createContext<PlanningState | null>(null);
export function usePlanning() {
  const state = useContext(PlanningContext);
  if (!state) throw new Error('PlanningProvider diperlukan.');
  return state;
}
