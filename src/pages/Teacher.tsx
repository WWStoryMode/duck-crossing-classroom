import { useEffect, useState, type FormEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { KEY_DISCLAIMER, TABLES } from '../../shared/content';
import { evaluate } from '../../shared/evaluate';
import { ANSWER_LABELS, TABLE_IDS, type Submission, type TableId, type TeacherResult } from '../../shared/types';
import ConnectionDot from '../components/ConnectionDot';
import DistributionBars from '../components/DistributionBars';
import DuckIcon from '../components/DuckIcon';
import { EVAL_CELL, EVAL_ICON } from '../components/EvalBadge';
import Outcomes from '../components/Outcomes';
import { socket, useServerState } from '../socket';

// Teacher token lives in page memory only. Refreshing the page means logging in again.
let token: string | null = null;
let publicUrl = '';

type AuthResult = TeacherResult<{ token: string; publicUrl: string }>;

export default function Teacher() {
  const server = useServerState();
  const [authed, setAuthed] = useState(!!token);
  const [code, setCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tableId, setTableId] = useState<TableId>(1);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const onSubs = (s: Submission[]) => setSubmissions(s);
    // Re-authenticate automatically after a reconnect so teacher data keeps flowing.
    const onConnect = () => {
      if (token) socket.emit('teacher:auth', { token }, (r: AuthResult) => !r.ok && logout());
    };
    socket.on('teacher:submissions', onSubs);
    socket.on('connect', onConnect);
    if (token && socket.connected) onConnect();
    return () => {
      socket.off('teacher:submissions', onSubs);
      socket.off('connect', onConnect);
    };
  }, []);

  function logout() {
    token = null;
    setAuthed(false);
  }

  function login(e: FormEvent) {
    e.preventDefault();
    setLoginError('');
    socket.timeout(8000).emit('teacher:auth', { code }, (err: Error | null, r?: AuthResult) => {
      if (err || !r) return setLoginError('Could not reach the server.');
      if (!r.ok) return setLoginError(r.error);
      token = r.token;
      publicUrl = r.publicUrl;
      setCode('');
      setAuthed(true);
    });
  }

  function action(event: string, arg?: unknown, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setActionError('');
    socket.timeout(8000).emit(event, arg, (err: Error | null, r?: TeacherResult) => {
      setBusy(false);
      if (err || !r) return setActionError('Could not reach the server. Try again.');
      if (!r.ok) {
        setActionError(r.error);
        logout();
      }
    });
  }

  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="text-center">
          <DuckIcon className="mx-auto h-16 w-16" />
          <h1 className="mt-3 text-3xl font-bold">Teacher dashboard</h1>
        </div>
        <form onSubmit={login} className="card mt-6 space-y-4">
          <label htmlFor="code" className="block font-bold">
            Access code
          </label>
          <input
            id="code"
            type="password"
            className="input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
            autoFocus
          />
          {loginError && (
            <p role="alert" className="rounded-xl bg-brick-light p-3 font-bold text-brick-dark">
              {loginError}
            </p>
          )}
          <button className="btn-primary w-full" type="submit" disabled={!code.trim()}>
            Log in
          </button>
        </form>
      </main>
    );
  }

  const joinUrl = (publicUrl || window.location.origin).replace(/\/$/, '') + '/';
  const table = TABLES[tableId];
  const tableSubs = submissions.filter((s) => s.table === tableId);
  const realTotal = server ? TABLE_IDS.reduce((n, t) => n + server.tables[t].real, 0) : 0;
  const demoTotal = server ? TABLE_IDS.reduce((n, t) => n + server.tables[t].demo, 0) : 0;
  const key = server?.revealed ? server.key : null;
  const summary = server?.tables[tableId];

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <DuckIcon className="h-10 w-10" />
          <h1 className="text-2xl font-bold">Duck Crossing · Teacher</h1>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionDot />
          <a href="/present" target="_blank" rel="noreferrer" className="btn-secondary">
            Open presentation ↗
          </a>
          <a href="/results" target="_blank" rel="noreferrer" className="btn-secondary">
            Open projector view ↗
          </a>
        </div>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
        {/* Status + controls */}
        <section className="card space-y-4" aria-label="Session controls">
          <div className="flex flex-wrap gap-3">
            <Stat label="Groups submitted" value={realTotal} />
            {TABLE_IDS.map((t) => (
              <Stat key={t} label={`Table ${t}`} value={server?.tables[t].real ?? 0} />
            ))}
            {demoTotal > 0 && <Stat label="Demo responses" value={demoTotal} demo />}
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={server?.locked ? 'btn-primary' : 'btn-secondary'} disabled={busy} onClick={() => action('teacher:lock', !server?.locked)}>
              {server?.locked ? '🔓 Unlock submissions' : '🔒 Lock submissions'}
            </button>
            <button className={server?.revealed ? 'btn-primary' : 'btn-secondary'} disabled={busy} onClick={() => action('teacher:reveal', !server?.revealed)}>
              {server?.revealed ? '🙈 Hide suggested answers' : '👁 Reveal suggested answers'}
            </button>
            <button
              className="btn-danger"
              disabled={busy}
              onClick={() => action('teacher:reset', undefined, 'Delete ALL submissions (real and demo), unlock and hide answers? This cannot be undone.')}
            >
              Reset session
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-cream p-3">
            <span className="mr-2 text-sm font-bold">Demo mode:</span>
            <button className="btn-secondary" disabled={busy} onClick={() => action('teacher:demo:add')}>
              + Add demo responses (1 per table)
            </button>
            <button className="btn-secondary" disabled={busy || demoTotal === 0} onClick={() => action('teacher:demo:clear')}>
              Clear demo responses
            </button>
            <span className="text-sm text-navy-soft">Demo responses are labelled DEMO everywhere and shown hatched in charts.</span>
          </div>
          <p className="text-sm text-navy-soft">
            Status: submissions <strong>{server?.locked ? 'locked' : 'open'}</strong> · suggested answers{' '}
            <strong>{server?.revealed ? 'revealed to everyone' : 'hidden'}</strong>
          </p>
          {actionError && (
            <p role="alert" className="rounded-xl bg-brick-light p-3 font-bold text-brick-dark">
              {actionError}
            </p>
          )}
        </section>

        {/* Join */}
        <section className="card flex flex-col items-center gap-2 text-center" aria-label="Join link">
          <QRCodeSVG value={joinUrl} size={180} bgColor="#FFFFFF" fgColor="#1B2A41" marginSize={2} title="QR code to join" />
          <p className="max-w-[220px] break-all font-bold">{joinUrl}</p>
          {/localhost|127\.0\.0\.1/.test(joinUrl) && (
            <p className="max-w-[220px] text-xs text-brick-dark">
              This is a localhost address — phones can't open it. Use your public URL or set PUBLIC_URL.
            </p>
          )}
        </section>
      </div>

      {/* Table tabs */}
      <div role="tablist" aria-label="Tables" className="mt-6 flex flex-wrap gap-2">
        {TABLE_IDS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={t === tableId}
            onClick={() => setTableId(t)}
            className={`btn ${t === tableId ? 'bg-navy text-paper' : 'border-2 border-navy/20 bg-paper hover:border-navy'}`}
          >
            Table {t} <span className="font-normal">({server?.tables[t].real ?? 0}{server?.tables[t].demo ? ` + ${server.tables[t].demo} demo` : ''})</span>
          </button>
        ))}
      </div>

      <section role="tabpanel" className="mt-4 space-y-5">
        <h2 className="text-2xl font-bold">
          Table {tableId}: {table.title}
        </h2>
        <Outcomes table={table} />
        {key && <p className="text-sm text-navy-soft">{KEY_DISCLAIMER}</p>}

        {/* Response grid */}
        <div className="card overflow-x-auto p-0">
          {tableSubs.length === 0 ? (
            <p className="p-5 text-navy-soft">No responses for this table yet.</p>
          ) : (
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">Answers per group for Table {tableId}</caption>
              <thead>
                <tr className="border-b border-navy/10 bg-cream">
                  <th scope="col" className="p-3">Mechanic</th>
                  {key && <th scope="col" className="p-3">Suggested</th>}
                  {tableSubs.map((s, i) => (
                    <th key={s.id} scope="col" className={`p-3 ${s.isDemo ? 'demo-hatch bg-navy/5' : ''}`}>
                      <GroupLabel s={s} i={i} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.cards.map((card) => {
                  const k = key?.[card.id];
                  return (
                    <tr key={card.id} className="border-b border-navy/10 align-top">
                      <th scope="row" className="max-w-[280px] p-3 font-normal">
                        <strong>{card.id}</strong> {card.text}
                      </th>
                      {k && (
                        <td className="p-3 font-bold">
                          {ANSWER_LABELS[k.preferred]}
                          {k.alternatives.length > 0 && (
                            <span className="block font-normal text-navy-soft">alt: {k.alternatives.map((a) => ANSWER_LABELS[a]).join(', ')}</span>
                          )}
                        </td>
                      )}
                      {tableSubs.map((s) => {
                        const ev = evaluate(k, s.answers[card.id]);
                        return (
                          <td key={s.id} className={`p-3 font-bold ${ev ? EVAL_CELL[ev] : ''}`}>
                            {ev && <span aria-hidden>{EVAL_ICON[ev]} </span>}
                            {ANSWER_LABELS[s.answers[card.id]]}
                            {ev && <span className="sr-only"> ({ev === 'match' ? 'matches' : ev === 'discuss' ? 'open for discussion' : 'reconsider'})</span>}
                            {s.debatableCardId === card.id && (
                              <span className="ml-1 rounded bg-mustard px-1 text-xs text-navy" title="Marked as debatable">
                                debatable
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Justifications */}
        <div className="card">
          <h3 className="text-xl font-bold">Debatable cards &amp; reasoning</h3>
          {tableSubs.filter((s) => s.debatableCardId || s.justification).length === 0 ? (
            <p className="mt-2 text-navy-soft">No written justifications yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {tableSubs.map((s, i) =>
                s.debatableCardId || s.justification ? (
                  <li key={s.id} className={`rounded-xl border border-navy/10 p-3 ${s.isDemo ? 'bg-navy/5' : 'bg-paper'}`}>
                    <p className="font-bold">
                      <GroupLabel s={s} i={i} />
                      {s.debatableCardId && <span className="ml-2 rounded bg-mustard-light px-2 py-0.5 text-sm">Card {s.debatableCardId}</span>}
                    </p>
                    {s.justification && <p className="mt-1 whitespace-pre-wrap">{s.justification}</p>}
                  </li>
                ) : null,
              )}
            </ul>
          )}
        </div>

        {/* Mini distributions */}
        {summary && (
          <div className="grid gap-4 md:grid-cols-2">
            {table.cards.map((card) => (
              <div key={card.id} className="card">
                <p className="font-bold">
                  {card.id} <span className="font-normal">{card.text}</span>
                </p>
                <div className="mt-2">
                  <DistributionBars distribution={summary.distribution[card.id]} total={summary.real + summary.demo} keyEntry={key?.[card.id]} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, demo = false }: { label: string; value: number; demo?: boolean }) {
  return (
    <div className={`min-w-[100px] rounded-xl px-4 py-2 ${demo ? 'demo-hatch bg-mustard-light' : 'bg-cream'}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-navy-soft">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function GroupLabel({ s, i }: { s: Submission; i: number }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {s.isDemo && <span className="rounded bg-navy px-1.5 py-0.5 text-xs font-bold text-paper">DEMO</span>}
      <span>{s.groupName || `Group ${i + 1}`}</span>
    </span>
  );
}
