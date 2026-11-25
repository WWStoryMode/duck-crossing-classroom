import { randomUUID } from 'node:crypto';
import { TABLES } from '../shared/content';
import { ANSWERS, TABLE_IDS, type Answer, type TableId } from '../shared/types';
import { ANSWER_KEY } from './answerKey';
import { addSubmissionRecord, countDemo } from './state';

const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

const SAMPLE_REASONS = [
  'We disagreed on whether this supports judgement or just recognition.',
  'It depends on whether the game explains the outcome to the player.',
  'Automatic behaviour means the player is not really making a decision.',
  'This could reward speed over safety, which feels risky.',
];

/** Adds one clearly-labelled demo response to each table. */
export function addDemoRound() {
  for (const t of TABLE_IDS as TableId[]) {
    const cards = TABLES[t].cards;
    const answers: Record<string, Answer> = {};
    for (const c of cards) {
      const key = ANSWER_KEY[c.id];
      const r = Math.random();
      answers[c.id] =
        r < 0.55 ? key.preferred : r < 0.8 && key.alternatives.length ? pick(key.alternatives) : pick(ANSWERS);
    }
    const now = Date.now();
    addSubmissionRecord({
      id: randomUUID(),
      table: t,
      groupName: `Demo group ${countDemo(t) + 1}`,
      answers,
      debatableCardId: pick(cards).id,
      justification: `[Demo] ${pick(SAMPLE_REASONS)}`,
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    });
  }
}
