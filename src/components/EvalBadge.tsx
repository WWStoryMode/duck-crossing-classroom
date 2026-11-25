import { EVALUATION_LABELS } from '../../shared/evaluate';
import type { Evaluation } from '../../shared/types';

const STYLES: Record<Evaluation, { cls: string; icon: string }> = {
  match: { cls: 'bg-sage-light text-sage-dark border-sage-dark', icon: '✓' },
  discuss: { cls: 'bg-mustard-light text-mustard-dark border-mustard-dark', icon: '◐' },
  reconsider: { cls: 'bg-brick-light text-brick-dark border-brick-dark', icon: '↺' },
};

/** Colour + icon + text, so meaning never relies on colour alone. */
export default function EvalBadge({ evaluation, compact = false }: { evaluation: Evaluation; compact?: boolean }) {
  const s = STYLES[evaluation];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 font-bold ${s.cls} ${
        compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <span aria-hidden>{s.icon}</span>
      {EVALUATION_LABELS[evaluation]}
    </span>
  );
}

export const EVAL_CELL: Record<Evaluation, string> = {
  match: 'bg-sage-light text-sage-dark',
  discuss: 'bg-mustard-light text-mustard-dark',
  reconsider: 'bg-brick-light text-brick-dark',
};
export const EVAL_ICON: Record<Evaluation, string> = { match: '✓', discuss: '◐', reconsider: '↺' };
