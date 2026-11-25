import { useRef, type KeyboardEvent } from 'react';
import { ANSWERS, ANSWER_LABELS, type Answer } from '../../shared/types';

interface Props {
  name: string;
  labelledBy: string;
  value: Answer | undefined;
  onChange: (a: Answer) => void;
  disabled?: boolean;
}

/** Large, keyboard-accessible radio group (Tab in, arrows to move, Space/Enter to select). */
export default function AnswerPicker({ name, labelledBy, value, onChange, disabled }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusIndex = value ? ANSWERS.indexOf(value) : 0;

  function onKeyDown(e: KeyboardEvent, i: number) {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + ANSWERS.length) % ANSWERS.length;
    refs.current[next]?.focus();
    onChange(ANSWERS[next]);
  }

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {ANSWERS.map((a, i) => {
        const selected = value === a;
        return (
          <button
            key={a}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="radio"
            name={name}
            aria-checked={selected}
            tabIndex={i === focusIndex ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(a)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 px-3 text-base font-bold transition
              disabled:cursor-not-allowed disabled:opacity-60 ${
                selected
                  ? 'border-navy bg-navy text-paper'
                  : 'border-navy/25 bg-paper text-navy hover:border-navy hover:bg-cream'
              }`}
          >
            <span aria-hidden className={`inline-block h-4 w-4 rounded-full border-2 ${selected ? 'border-paper bg-mustard' : 'border-navy/40'}`} />
            {ANSWER_LABELS[a]}
          </button>
        );
      })}
    </div>
  );
}
