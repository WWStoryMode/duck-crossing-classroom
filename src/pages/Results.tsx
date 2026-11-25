import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { KEY_DISCLAIMER, TABLES } from '../../shared/content';
import { TABLE_IDS, type TableId } from '../../shared/types';
import ConnectionDot from '../components/ConnectionDot';
import DistributionBars from '../components/DistributionBars';
import DuckIcon from '../components/DuckIcon';
import Outcomes from '../components/Outcomes';
import { useServerState } from '../socket';

export default function Results() {
  const server = useServerState();
  const [params, setParams] = useSearchParams();
  const initial = Number(params.get('table'));
  const [tableId, setTableId] = useState<TableId>(TABLE_IDS.includes(initial as TableId) ? (initial as TableId) : 1);

  const go = useCallback(
    (delta: number) => {
      setTableId((t) => {
        const idx = (TABLE_IDS.indexOf(t) + delta + TABLE_IDS.length) % TABLE_IDS.length;
        const next = TABLE_IDS[idx];
        setParams({ table: String(next) }, { replace: true });
        return next;
      });
    },
    [setParams],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const table = TABLES[tableId];
  const summary = server?.tables[tableId];
  const total = summary ? summary.real + summary.demo : 0;
  const key = server?.revealed ? server.key : null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <DuckIcon className="h-12 w-12" />
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-sage-dark">Duck Crossing · Live results</p>
            <h1 className="text-3xl font-bold lg:text-4xl">
              Table {tableId}: {table.title}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ConnectionDot />
          <span className="rounded-full bg-cream px-3 py-1 font-bold" aria-live="polite">
            {summary?.real ?? 0} group{summary?.real === 1 ? '' : 's'} submitted
            {summary?.demo ? ` + ${summary.demo} demo` : ''}
          </span>
          {server?.locked && <span className="rounded-full bg-navy px-3 py-1 font-bold text-paper">🔒 Locked</span>}
          <button className="btn-secondary" onClick={() => go(-1)}>
            ← Previous table
          </button>
          <button className="btn-primary" onClick={() => go(1)}>
            Next table →
          </button>
        </div>
      </header>

      <div className="mt-5">
        <Outcomes table={table} large />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-navy-soft">
        {summary?.demo ? (
          <span className="inline-flex items-center gap-2">
            <span className="demo-hatch inline-block h-4 w-8 rounded bg-navy/40" aria-hidden /> Hatched = demo (simulated) responses
          </span>
        ) : null}
        {key ? (
          <span>
            <strong className="text-sage-dark">✓ Suggested</strong> · <strong className="text-mustard-dark">◐ Also defensible</strong> ·{' '}
            {KEY_DISCLAIMER}
          </span>
        ) : (
          <span>Suggested answers are hidden until the teacher reveals them.</span>
        )}
      </div>

      {!server ? (
        <p className="mt-10 text-center text-xl">Connecting to the classroom server…</p>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {table.cards.map((card) => (
            <section key={card.id} className="card" aria-labelledby={`res-${card.id}`}>
              <h2 id={`res-${card.id}`} className="text-lg font-bold leading-snug lg:text-xl">
                <span className="mr-2 inline-block rounded-lg bg-navy px-2 py-0.5 text-sm text-paper lg:text-base">{card.id}</span>
                {card.text}
              </h2>
              <div className="mt-3">
                <DistributionBars distribution={summary!.distribution[card.id]} total={total} keyEntry={key?.[card.id]} large />
              </div>
              {key && <p className="mt-3 rounded-xl bg-paper p-3 leading-relaxed lg:text-lg">{key[card.id].explanation}</p>}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
