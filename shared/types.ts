export const ANSWERS = ['A', 'B', 'Both', 'Neither'] as const;
export type Answer = (typeof ANSWERS)[number];

export const ANSWER_LABELS: Record<Answer, string> = {
  A: 'A only',
  B: 'B only',
  Both: 'Both',
  Neither: 'Neither',
};

export type TableId = 1 | 2 | 3 | 4;
export const TABLE_IDS: TableId[] = [1, 2, 3, 4];

export type Evaluation = 'match' | 'discuss' | 'reconsider';

export interface Card {
  id: string; // e.g. "1.4"
  text: string;
}

export interface TableContent {
  id: TableId;
  title: string;
  outcomeA: string;
  outcomeB: string;
  cards: Card[];
}

export interface KeyEntry {
  preferred: Answer;
  alternatives: Answer[];
  explanation: string;
}

/** Full submission record — only ever sent to the authenticated teacher. */
export interface Submission {
  id: string;
  table: TableId;
  groupName: string;
  answers: Record<string, Answer>;
  debatableCardId: string | null;
  justification: string;
  isDemo: boolean;
  createdAt: number;
  updatedAt: number;
}

export type Tally = { real: number; demo: number };

export interface TableSummary {
  real: number;
  demo: number;
  /** cardId -> answer -> counts */
  distribution: Record<string, Record<Answer, Tally>>;
}

/** Broadcast to everyone. Contains no group names, no justifications and (before reveal) no key. */
export interface PublicState {
  sessionId: string;
  locked: boolean;
  revealed: boolean;
  tables: Record<TableId, TableSummary>;
  key: Record<string, KeyEntry> | null;
}

export interface SubmitPayload {
  clientKey: string;
  submissionId: string | null;
  table: TableId;
  groupName: string;
  answers: Record<string, Answer>;
  debatableCardId: string | null;
  justification: string;
}

export type SubmitResult =
  | { ok: true; submissionId: string; created: boolean }
  | { ok: false; error: 'locked' | 'invalid' | 'unknown-id'; message: string };

export type TeacherResult<T = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string };
