import type { Answer, Evaluation, KeyEntry } from './types';

export function evaluate(entry: KeyEntry | undefined, answer: Answer | undefined): Evaluation | null {
  if (!entry || !answer) return null;
  if (answer === entry.preferred) return 'match';
  if (entry.alternatives.includes(answer)) return 'discuss';
  return 'reconsider';
}

export const EVALUATION_LABELS: Record<Evaluation, string> = {
  match: 'Matches suggested answer',
  discuss: 'Open for discussion',
  reconsider: 'Reconsider',
};
