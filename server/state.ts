import { randomUUID } from 'node:crypto';
import { TABLES } from '../shared/content';
import { ANSWERS, TABLE_IDS, type Answer, type PublicState, type Submission, type SubmitPayload, type SubmitResult, type TableId, type TableSummary } from '../shared/types';
import { ANSWER_KEY } from './answerKey';

/** The one classroom session. Lives only in this process's memory. */
const session = {
  id: randomUUID(),
  locked: false,
  revealed: false,
  submissions: new Map<string, Submission>(),
  /** clientKey -> submissionId; stops a retried "create" (e.g. after a flaky connection) making a duplicate. */
  clientKeys: new Map<string, string>(),
};

const MAX_NAME = 60;
const MAX_JUSTIFICATION = 1000;

export const isLocked = () => session.locked;
export const isRevealed = () => session.revealed;
export const setLocked = (v: boolean) => void (session.locked = v);
export const setRevealed = (v: boolean) => void (session.revealed = v);

export function resetSession() {
  session.id = randomUUID();
  session.submissions.clear();
  session.clientKeys.clear();
  session.locked = false;
  session.revealed = false;
}

export function allSubmissions(): Submission[] {
  return [...session.submissions.values()].sort((a, b) => a.createdAt - b.createdAt);
}

export function addSubmissionRecord(s: Submission) {
  session.submissions.set(s.id, s);
}

export function clearDemo() {
  for (const [id, s] of session.submissions) if (s.isDemo) session.submissions.delete(id);
}

export function countDemo(table: TableId) {
  return allSubmissions().filter((s) => s.isDemo && s.table === table).length;
}

function isTableId(v: unknown): v is TableId {
  return typeof v === 'number' && (TABLE_IDS as number[]).includes(v);
}

function clean(v: unknown, max: number) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export function submit(raw: Partial<SubmitPayload> | undefined): SubmitResult {
  if (session.locked) {
    return { ok: false, error: 'locked', message: 'Submissions are locked by the teacher.' };
  }
  if (!raw || !isTableId(raw.table)) {
    return { ok: false, error: 'invalid', message: 'Please choose a valid table.' };
  }
  const table = TABLES[raw.table];
  const answers: Record<string, Answer> = {};
  for (const card of table.cards) {
    const a = raw.answers?.[card.id];
    if (!a || !ANSWERS.includes(a)) {
      return { ok: false, error: 'invalid', message: 'Please classify all six mechanics before submitting.' };
    }
    answers[card.id] = a;
  }
  const debatableCardId =
    raw.debatableCardId && table.cards.some((c) => c.id === raw.debatableCardId) ? raw.debatableCardId : null;
  const fields = {
    table: raw.table,
    groupName: clean(raw.groupName, MAX_NAME),
    answers,
    debatableCardId,
    justification: clean(raw.justification, MAX_JUSTIFICATION),
  };
  const now = Date.now();

  // Revision of an existing submission.
  if (raw.submissionId) {
    const existing = session.submissions.get(raw.submissionId);
    if (!existing || existing.isDemo) {
      return {
        ok: false,
        error: 'unknown-id',
        message: 'Your earlier submission is no longer on the server (the session was reset). Submitting again will count as a new response.',
      };
    }
    Object.assign(existing, fields, { updatedAt: now });
    return { ok: true, submissionId: existing.id, created: false };
  }

  // Duplicate "create" from the same page (double click / retry after reconnect) → update instead.
  const clientKey = clean(raw.clientKey, 100);
  const priorId = clientKey ? session.clientKeys.get(clientKey) : undefined;
  const prior = priorId ? session.submissions.get(priorId) : undefined;
  if (prior) {
    Object.assign(prior, fields, { updatedAt: now });
    return { ok: true, submissionId: prior.id, created: false };
  }

  const id = randomUUID();
  session.submissions.set(id, { id, ...fields, isDemo: false, createdAt: now, updatedAt: now });
  if (clientKey) session.clientKeys.set(clientKey, id);
  return { ok: true, submissionId: id, created: true };
}

export function publicState(): PublicState {
  const tables = {} as Record<TableId, TableSummary>;
  for (const t of TABLE_IDS) {
    const distribution: TableSummary['distribution'] = {};
    for (const card of TABLES[t].cards) {
      distribution[card.id] = Object.fromEntries(ANSWERS.map((a) => [a, { real: 0, demo: 0 }])) as Record<
        Answer,
        { real: number; demo: number }
      >;
    }
    tables[t] = { real: 0, demo: 0, distribution };
  }
  for (const s of session.submissions.values()) {
    const summary = tables[s.table];
    const kind = s.isDemo ? 'demo' : 'real';
    summary[kind]++;
    for (const [cardId, answer] of Object.entries(s.answers)) summary.distribution[cardId][answer][kind]++;
  }
  return {
    sessionId: session.id,
    locked: session.locked,
    revealed: session.revealed,
    tables,
    key: session.revealed ? ANSWER_KEY : null,
  };
}
