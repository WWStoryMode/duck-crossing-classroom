import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { KEY_DISCLAIMER, TABLES } from '../../shared/content';
import { evaluate } from '../../shared/evaluate';
import { ANSWER_LABELS, TABLE_IDS, type Answer, type SubmitPayload, type SubmitResult, type TableId } from '../../shared/types';
import AnswerPicker from '../components/AnswerPicker';
import ConnectionDot from '../components/ConnectionDot';
import DuckIcon from '../components/DuckIcon';
import EvalBadge from '../components/EvalBadge';
import Outcomes from '../components/Outcomes';
import { socket, useServerState } from '../socket';

const randomKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

type Status = 'idle' | 'pending' | 'submitted';

export default function Activity() {
  const [params] = useSearchParams();
  const location = useLocation();
  const tableNum = Number(params.get('table')) as TableId;
  const valid = TABLE_IDS.includes(tableNum);

  const server = useServerState();
  const [groupName, setGroupName] = useState<string>((location.state as { groupName?: string } | null)?.groupName ?? '');
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [debatableCardId, setDebatableCardId] = useState('');
  const [justification, setJustification] = useState('');

  // Submission tracking — kept only in this page's memory.
  const clientKey = useRef(randomKey());
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [submittedSessionId, setSubmittedSessionId] = useState<string | null>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, Answer> | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);

  // If the teacher resets the session, our old submission is gone: say so clearly.
  useEffect(() => {
    if (server && submissionId && submittedSessionId && server.sessionId !== submittedSessionId) {
      setSubmissionId(null);
      setSubmittedSessionId(null);
      setSubmittedAnswers(null);
      setStatus('idle');
      clientKey.current = randomKey();
      setMessage({
        kind: 'info',
        text: 'The teacher has reset the session, so your earlier submission was cleared. Your answers are still here — submitting again will count as a new response.',
      });
    }
  }, [server, submissionId, submittedSessionId]);

  const table = valid ? TABLES[tableNum] : null;
  const answeredCount = useMemo(() => (table ? table.cards.filter((c) => answers[c.id]).length : 0), [table, answers]);
  if (!table) return <Navigate to="/" replace />;

  const total = table.cards.length;
  const complete = answeredCount === total;
  const locked = server?.locked ?? false;
  const revealed = !!server?.revealed && !!server.key;
  const canSubmit = complete && !locked && status !== 'pending' && (status !== 'submitted' || dirty);

  const edit = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setDirty(true);
  };

  function submit() {
    if (!table || !canSubmit) return;
    setStatus('pending');
    setMessage(null);
    const payload: SubmitPayload = {
      clientKey: clientKey.current,
      submissionId,
      table: table.id,
      groupName,
      answers,
      debatableCardId: debatableCardId || null,
      justification,
    };
    const sentAnswers = { ...answers };
    socket.timeout(10_000).emit('submit', payload, (err: Error | null, res?: SubmitResult) => {
      if (err || !res) {
        setStatus(submissionId ? 'submitted' : 'idle');
        setMessage({ kind: 'error', text: 'Could not reach the server. Check your connection and press submit again.' });
        return;
      }
      if (res.ok) {
        setSubmissionId(res.submissionId);
        setSubmittedSessionId(server?.sessionId ?? null);
        setSubmittedAnswers(sentAnswers);
        setStatus('submitted');
        setDirty(false);
        return;
      }
      if (res.error === 'unknown-id') {
        setSubmissionId(null);
        setSubmittedAnswers(null);
        clientKey.current = randomKey();
      }
      setStatus(res.error === 'unknown-id' ? 'idle' : submissionId ? 'submitted' : 'idle');
      setMessage({ kind: res.error === 'unknown-id' ? 'info' : 'error', text: res.message });
    });
  }

  const evalAnswers = submittedAnswers ?? answers;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-40 pt-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2 font-bold underline-offset-4 hover:underline">
          <DuckIcon className="h-8 w-8" /> Duck Crossing
        </Link>
        <ConnectionDot />
      </header>

      <h1 className="mt-4 text-3xl font-bold">
        Table {table.id}: {table.title}
      </h1>
      {groupName && <p className="mt-1 text-navy-soft">Group: {groupName}</p>}

      <div className="mt-5">
        <Outcomes table={table} />
      </div>

      {!submissionId && (
        <p className="mt-4 rounded-xl bg-cream p-3 text-sm">
          Your submission is linked to this open page only. If you refresh or close it, submitting again will count as a{' '}
          <strong>new response</strong>.
        </p>
      )}

      {locked && (
        <p role="status" className="mt-4 rounded-xl border-2 border-navy bg-cream p-3 font-bold">
          🔒 Submissions are locked by the teacher.
        </p>
      )}

      {revealed && (
        <p className="mt-4 rounded-xl bg-sage-light p-3 text-sm">
          <strong>Suggested answers revealed.</strong> {KEY_DISCLAIMER}
        </p>
      )}

      <ol className="mt-6 space-y-4">
        {table.cards.map((card) => {
          const key = revealed ? server!.key![card.id] : undefined;
          const ev = evaluate(key, evalAnswers[card.id]);
          return (
            <li key={card.id} className="card">
              <p id={`card-${card.id}`} className="text-lg font-bold leading-snug">
                <span className="mr-2 inline-block rounded-lg bg-navy px-2 py-0.5 text-sm text-paper">{card.id}</span>
                {card.text}
              </p>
              <div className="mt-4">
                <AnswerPicker
                  name={`answer-${card.id}`}
                  labelledBy={`card-${card.id}`}
                  value={answers[card.id]}
                  onChange={(a) => edit(setAnswers)({ ...answers, [card.id]: a })}
                  disabled={locked}
                />
              </div>
              {key && (
                <div className="mt-4 space-y-2 rounded-xl bg-paper p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {ev && <EvalBadge evaluation={ev} />}
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                    <dt className="font-bold">Your answer:</dt>
                    <dd>{evalAnswers[card.id] ? ANSWER_LABELS[evalAnswers[card.id]] : '—'}</dd>
                    <dt className="font-bold">Suggested:</dt>
                    <dd>{ANSWER_LABELS[key.preferred]}</dd>
                    {key.alternatives.length > 0 && (
                      <>
                        <dt className="font-bold">Also defensible:</dt>
                        <dd>{key.alternatives.map((a) => ANSWER_LABELS[a]).join(', ')}</dd>
                      </>
                    )}
                  </dl>
                  <p className="text-sm leading-relaxed">{key.explanation}</p>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <section className="card mt-6 space-y-4">
        <h2 className="text-xl font-bold">
          Debatable card <span className="text-base font-normal text-navy-soft">(optional)</span>
        </h2>
        <div>
          <label htmlFor="debatable" className="font-bold">
            Which card did your group find most debatable?
          </label>
          <select
            id="debatable"
            className="input mt-2"
            value={debatableCardId}
            onChange={(e) => edit(setDebatableCardId)(e.target.value)}
            disabled={locked}
          >
            <option value="">— Choose a card —</option>
            {table.cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.text}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="justification" className="font-bold">
            Explain your reasoning
          </label>
          <textarea
            id="justification"
            className="input mt-2 min-h-[110px]"
            maxLength={1000}
            value={justification}
            onChange={(e) => edit(setJustification)(e.target.value)}
            disabled={locked}
            placeholder="Why could this card go either way?"
          />
        </div>
        <div>
          <label htmlFor="group-edit" className="font-bold">
            Group name <span className="font-normal text-navy-soft">(optional)</span>
          </label>
          <input
            id="group-edit"
            className="input mt-2"
            maxLength={60}
            value={groupName}
            onChange={(e) => edit(setGroupName)(e.target.value)}
            disabled={locked}
          />
        </div>
      </section>

      {/* Sticky submit bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-navy/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="min-w-[120px] flex-1">
            <p className="font-bold" aria-live="polite">
              {answeredCount}/{total} answered
            </p>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-cream" aria-hidden>
              <div className="h-full bg-sage transition-all" style={{ width: `${(answeredCount / total) * 100}%` }} />
            </div>
          </div>
          <button type="button" className="btn-primary text-lg" onClick={submit} disabled={!canSubmit}>
            {status === 'pending'
              ? 'Sending…'
              : status === 'submitted'
                ? dirty
                  ? 'Update answers'
                  : 'Submitted ✓'
                : 'Submit answers'}
          </button>
          <div className="w-full" aria-live="polite">
            {status === 'submitted' && !message && (
              <p className="rounded-lg bg-sage-light px-3 py-2 text-sm font-bold text-sage-dark">
                ✓ Answers submitted.{' '}
                {locked ? '' : dirty ? 'You have unsaved changes — press “Update answers”.' : 'You can still change them until the teacher locks submissions.'}
              </p>
            )}
            {!complete && !locked && (
              <p className="text-sm text-navy-soft">Classify all {total} mechanics to submit.</p>
            )}
            {message && (
              <p
                role={message.kind === 'error' ? 'alert' : 'status'}
                className={`rounded-lg px-3 py-2 text-sm font-bold ${
                  message.kind === 'error' ? 'bg-brick-light text-brick-dark' : 'bg-mustard-light text-navy'
                }`}
              >
                {message.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
