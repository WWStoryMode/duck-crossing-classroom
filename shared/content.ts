import type { TableContent, TableId } from './types';

export const GAME = {
  title: 'Duck Crossing',
  subtitle: 'A learning game in development',
  description:
    'You play as a parent duck guiding six ducklings across busy roads to reach a pond. Along the journey, you encounter pedestrian signals, cars, cyclists and different crossing conditions. The challenge is to get the whole family across safely.',
  status:
    'The game is unfinished. The design team is still deciding how crossing, traffic behaviour, feedback, failure, flock management and winning should work.',
};

export const INSTRUCTIONS = [
  'Select your assigned table.',
  'Read Learning Outcomes A and B.',
  'Match each of the six mechanics to A only, B only, Both or Neither.',
  'Discuss your choices.',
  'Select one debatable card and explain your reasoning.',
  'Submit your answers.',
];

export const TABLES: Record<TableId, TableContent> = {
  1: {
    id: 1,
    title: 'Crossing Decisions & Traffic',
    outcomeA: 'Identify pedestrian signals and expected traffic behaviour.',
    outcomeB: 'Assess whether it is safe to cross by considering signals, traffic and potential hazards.',
    cards: [
      { id: '1.1', text: 'The player presses a button when the pedestrian signal turns green.' },
      { id: '1.2', text: 'The player can look left and right to inspect traffic before deciding whether to cross.' },
      { id: '1.3', text: 'Vehicles always stop correctly at red lights.' },
      { id: '1.4', text: 'Some cyclists may pass through red lights, even when the pedestrian signal is green.' },
      { id: '1.5', text: 'The game highlights the pedestrian signal before each crossing.' },
      { id: '1.6', text: 'The player must decide whether to cross, wait or choose another crossing point.' },
    ],
  },
  2: {
    id: 2,
    title: 'Feedback & Failure Consequences',
    outcomeA: 'Recognise whether a crossing decision was correct or incorrect.',
    outcomeB: 'Explain why a decision was unsafe and use that understanding to improve the next attempt.',
    cards: [
      { id: '2.1', text: 'Correct decisions earn 10 points; incorrect decisions lose 10 points.' },
      { id: '2.2', text: 'After an incorrect decision, the game explains which hazard the player overlooked.' },
      { id: '2.3', text: 'Any collision causes an immediate game over.' },
      { id: '2.4', text: 'After a collision, the player restarts the crossing with a time penalty.' },
      { id: '2.5', text: 'After an unsafe decision, the game replays the situation and asks the player to identify the mistake.' },
      { id: '2.6', text: 'The player encounters a similar situation with different traffic and must choose again.' },
    ],
  },
  3: {
    id: 3,
    title: 'Flock Management & Winning',
    outcomeA: 'Guide all ducklings together across the road successfully.',
    outcomeB: 'Evaluate how flock size, speed and timing can minimise crossing risks.',
    cards: [
      { id: '3.1', text: 'All six ducklings automatically follow the parent in a line.' },
      { id: '3.2', text: 'The player can choose how many ducklings to escort across at one time.' },
      { id: '3.3', text: 'A larger flock takes longer to cross the road.' },
      { id: '3.4', text: 'The player wins when all ducklings reach the destination.' },
      { id: '3.5', text: 'The player earns bonus points for completing the crossing quickly.' },
      { id: '3.6', text: 'The player must complete several different crossing situations without making unsafe decisions.' },
    ],
  },
  4: {
    id: 4,
    title: 'Observation & Difficulty',
    outcomeA: 'Identify basic road hazards and apply a familiar crossing procedure.',
    outcomeB: 'Adapt crossing decisions to unfamiliar situations involving multiple hazards.',
    cards: [
      { id: '4.1', text: 'The player repeatedly encounters the same pedestrian crossing.' },
      { id: '4.2', text: 'Players can inspect approaching vehicles and areas hidden behind parked cars.' },
      { id: '4.3', text: 'The game introduces new hazards one at a time.' },
      { id: '4.4', text: 'Later levels combine cyclists, obstructed views and slow-moving ducklings.' },
      { id: '4.5', text: 'Every new level reduces the time available to cross.' },
      { id: '4.6', text: 'The player must identify potential hazards before deciding which route to take.' },
    ],
  },
};

export const KEY_DISCLAIMER =
  'Suggested classifications are pedagogical interpretations, not scientifically established correct answers.';
