import { ANSWERS, ANSWER_LABELS, type Answer, type KeyEntry, type Tally } from '../../shared/types';

interface Props {
  distribution: Record<Answer, Tally>;
  total: number;
  keyEntry?: KeyEntry;
  large?: boolean;
}

/** Horizontal bars: solid = real groups, hatched = demo responses. */
export default function DistributionBars({ distribution, total, keyEntry, large = false }: Props) {
  return (
    <ul className="space-y-2">
      {ANSWERS.map((a) => {
        const { real, demo } = distribution[a];
        const count = real + demo;
        const preferred = keyEntry?.preferred === a;
        const alternative = keyEntry?.alternatives.includes(a) ?? false;
        const realPct = total ? (real / total) * 100 : 0;
        const demoPct = total ? (demo / total) * 100 : 0;
        const barColour = preferred ? 'bg-sage' : alternative ? 'bg-mustard' : 'bg-navy/60';
        return (
          <li
            key={a}
            className={`grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 rounded-xl px-2 py-1 ${
              preferred ? 'ring-[3px] ring-sage-dark' : alternative ? 'outline-dashed outline-2 outline-mustard-dark' : ''
            } ${large ? 'lg:grid-cols-[9rem_1fr_auto]' : ''}`}
          >
            <span className={`font-bold ${large ? 'text-lg lg:text-2xl' : ''}`}>{ANSWER_LABELS[a]}</span>
            <div
              className={`flex overflow-hidden rounded-lg bg-cream ${large ? 'h-8 lg:h-10' : 'h-6'}`}
              role="img"
              aria-label={`${ANSWER_LABELS[a]}: ${count} group${count === 1 ? '' : 's'}${demo ? `, including ${demo} demo` : ''}`}
            >
              <div className={`${barColour} transition-all duration-500`} style={{ width: `${realPct}%` }} />
              <div className={`${barColour} demo-hatch opacity-70 transition-all duration-500`} style={{ width: `${demoPct}%` }} />
            </div>
            <span className={`flex items-center gap-2 text-right font-bold tabular-nums ${large ? 'text-lg lg:text-2xl' : ''}`}>
              {count}
              {preferred && (
                <span className="rounded-full bg-sage-dark px-2 py-0.5 text-xs font-bold text-paper lg:text-sm">✓ Suggested</span>
              )}
              {alternative && (
                <span className="rounded-full bg-mustard-light px-2 py-0.5 text-xs font-bold text-mustard-dark ring-1 ring-mustard-dark lg:text-sm">
                  ◐ Also defensible
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
