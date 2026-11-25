import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME, INSTRUCTIONS, TABLES } from '../../shared/content';
import { TABLE_IDS, type TableId } from '../../shared/types';
import { DuckFamily } from '../components/DuckIcon';

export default function Landing() {
  const navigate = useNavigate();
  const [table, setTable] = useState<TableId | null>(null);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function start(e: FormEvent) {
    e.preventDefault();
    if (!table) return setError('Please choose your table first.');
    navigate(`/activity?table=${table}`, { state: { groupName: groupName.trim() } });
  }

  function onKeyDown(e: KeyboardEvent, i: number) {
    const delta = ['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(e.key) ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + TABLE_IDS.length) % TABLE_IDS.length;
    refs.current[next]?.focus();
    setTable(TABLE_IDS[next]);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header className="text-center">
        <DuckFamily className="mx-auto justify-center" />
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{GAME.title}</h1>
        <p className="mt-1 text-lg text-navy-soft">{GAME.subtitle}</p>
        <p className="mt-2 text-sm font-bold uppercase tracking-wide text-sage-dark">Pedagogy &amp; Game-Based Learning</p>
      </header>

      <section className="card mt-8 space-y-3 text-lg leading-relaxed">
        <p>{GAME.description}</p>
        <p className="rounded-xl bg-mustard-light p-3 text-base">
          <strong>🛠 In development: </strong>
          {GAME.status}
        </p>
      </section>

      <section className="card mt-6">
        <h2 className="text-xl font-bold">What you'll do</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-6 text-base">
          {INSTRUCTIONS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-navy-soft">There is no fixed number of mechanics per outcome.</p>
      </section>

      <form onSubmit={start} className="card mt-6 space-y-6">
        <fieldset>
          <legend id="table-label" className="text-xl font-bold">
            1. Select your table
          </legend>
          <div role="radiogroup" aria-labelledby="table-label" className="mt-3 grid gap-3 sm:grid-cols-2">
            {TABLE_IDS.map((t, i) => {
              const selected = table === t;
              return (
                <button
                  key={t}
                  ref={(el) => (refs.current[i] = el)}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected || (!table && i === 0) ? 0 : -1}
                  onClick={() => {
                    setTable(t);
                    setError('');
                  }}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={`min-h-[72px] rounded-2xl border-2 p-4 text-left transition ${
                    selected ? 'border-navy bg-navy text-paper' : 'border-navy/20 bg-paper hover:border-navy hover:bg-cream'
                  }`}
                >
                  <span className="block text-lg font-bold">Table {t}</span>
                  <span className={`block text-sm ${selected ? 'text-paper/90' : 'text-navy-soft'}`}>{TABLES[t].title}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="group" className="text-xl font-bold">
            2. Group name <span className="text-base font-normal text-navy-soft">(optional)</span>
          </label>
          <input
            id="group"
            className="input mt-3"
            maxLength={60}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. The Mallards"
            autoComplete="off"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-brick-light p-3 font-bold text-brick-dark">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full text-lg">
          Start →
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-navy-faint">
        Nothing is saved permanently — responses exist only for this classroom session.
      </p>
    </main>
  );
}
