import type { KeyEntry } from '../shared/types';

/**
 * Suggested classifications. Server-only: sent to clients only after the teacher reveals answers.
 * These are pedagogical interpretations, not scientifically established correct answers.
 */
export const ANSWER_KEY: Record<string, KeyEntry> = {
  // Table 1 — A: identify signals & expected traffic behaviour. B: assess whether it is safe to cross.
  '1.1': {
    preferred: 'A',
    alternatives: [],
    explanation:
      'Responding to the green signal practises recognising the pedestrian signal, but asks for no judgement about traffic or hazards.',
  },
  '1.2': {
    preferred: 'B',
    alternatives: ['Both'],
    explanation:
      'Looking left and right gathers the evidence needed to judge whether crossing is safe. It can also help players learn how traffic behaves, so "Both" is defensible.',
  },
  '1.3': {
    preferred: 'A',
    alternatives: ['Neither'],
    explanation:
      'Perfectly obedient vehicles model expected traffic behaviour. But with no risk to assess, it may teach false confidence — an argument for "Neither".',
  },
  '1.4': {
    preferred: 'B',
    alternatives: [],
    explanation:
      'Rule-breaking cyclists mean the signal alone is not enough: players must assess the actual hazards before crossing.',
  },
  '1.5': {
    preferred: 'A',
    alternatives: [],
    explanation:
      'Highlighting the signal scaffolds recognition of pedestrian signals, but the game does the noticing — the player is not judging safety.',
  },
  '1.6': {
    preferred: 'B',
    alternatives: ['Both'],
    explanation:
      'Choosing to cross, wait or reroute is the safety judgement itself. Because that choice also draws on reading the signal, "Both" is defensible.',
  },

  // Table 2 — A: recognise correct/incorrect. B: explain why unsafe and improve next attempt.
  '2.1': {
    preferred: 'A',
    alternatives: [],
    explanation: 'Points tell players whether a decision was right or wrong, but not why it was unsafe.',
  },
  '2.2': {
    preferred: 'Both',
    alternatives: [],
    explanation:
      'Naming the overlooked hazard confirms the decision was wrong (A) and explains why, giving players something to improve on (B).',
  },
  '2.3': {
    preferred: 'A',
    alternatives: ['Neither'],
    explanation:
      'Game over signals failure unmistakably, but offers no explanation or chance to improve. Its abruptness can also discourage learning — hence "Neither".',
  },
  '2.4': {
    preferred: 'A',
    alternatives: ['Neither'],
    explanation:
      'A time penalty marks the mistake, but without explanation players may just retry faster without understanding what went wrong.',
  },
  '2.5': {
    preferred: 'Both',
    alternatives: [],
    explanation:
      'Replaying the situation confirms an error and asks players to diagnose it — reflection that supports both recognition and explanation.',
  },
  '2.6': {
    preferred: 'B',
    alternatives: ['Neither'],
    explanation:
      'A varied repeat lets players apply what they learned to a new attempt. Without prior explanation it may become trial and error — so "Neither" is arguable.',
  },

  // Table 3 — A: guide all ducklings across. B: evaluate flock size, speed and timing to minimise risk.
  '3.1': {
    preferred: 'A',
    alternatives: ['Neither'],
    explanation:
      'Auto-following keeps the family together for a successful crossing. But because it is automatic, the player may not be "guiding" at all.',
  },
  '3.2': {
    preferred: 'Both',
    alternatives: ['B'],
    explanation:
      'Choosing group size is a strategic decision about risk (B) that also determines how the whole family gets across (A).',
  },
  '3.3': {
    preferred: 'B',
    alternatives: ['Neither'],
    explanation:
      'Linking flock size to crossing time creates the trade-off players must evaluate — but only if they notice and reason about it.',
  },
  '3.4': {
    preferred: 'A',
    alternatives: [],
    explanation: 'The win condition defines success as getting every duckling across, mirroring Outcome A directly.',
  },
  '3.5': {
    preferred: 'Neither',
    alternatives: [],
    explanation:
      'Rewarding speed encourages rushing, which works against careful risk evaluation and is not needed for a safe crossing.',
  },
  '3.6': {
    preferred: 'B',
    alternatives: ['Neither'],
    explanation:
      'Staying safe across varied situations requires evaluating risk each time. As a pass/fail rule it may measure rather than teach — hence "Neither".',
  },

  // Table 4 — A: identify basic hazards, apply a familiar procedure. B: adapt to unfamiliar, multi-hazard situations.
  '4.1': {
    preferred: 'A',
    alternatives: [],
    explanation:
      'Repeating the same crossing builds a familiar routine, but offers no unfamiliar situations to adapt to.',
  },
  '4.2': {
    preferred: 'Both',
    alternatives: ['B'],
    explanation:
      'Inspecting vehicles and hidden areas supports basic hazard identification, and becomes essential when hazards are obscured in new situations.',
  },
  '4.3': {
    preferred: 'A',
    alternatives: [],
    explanation: 'Introducing hazards one at a time scaffolds identification of each basic hazard in isolation.',
  },
  '4.4': {
    preferred: 'B',
    alternatives: [],
    explanation: 'Combining several hazards creates unfamiliar, complex situations that demand adaptation.',
  },
  '4.5': {
    preferred: 'Neither',
    alternatives: [],
    explanation:
      'Shrinking time adds pressure but does not teach hazard identification or adaptation — it may encourage guessing.',
  },
  '4.6': {
    preferred: 'Both',
    alternatives: ['B'],
    explanation:
      'Identifying hazards before choosing a route is the core procedure (A) and the foundation for adapting to new situations (B).',
  },
};
