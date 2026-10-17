// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { LunchAttendee } from '../../engine/types';
export const attendees = [
  {
    id: 'priya',
    name: 'Priya',
    role: 'Trying to get everyone to lunch',
    startsPresent: true,
    voice:
      'Calm, specific, politely interrupts; names the decision instead of performing authority.',
  },
  {
    id: 'dev',
    name: 'Dev',
    role: 'Checks before committing',
    startsPresent: true,
    voice:
      'Literal, practical, notices missing information; equipment is a distraction, not a personality.',
  },
  {
    id: 'sam',
    name: 'Sam',
    role: 'Wants a proper meal',
    startsPresent: true,
    voice:
      "Direct, patient until brushed off; real needs expose other people's empty helpfulness.",
  },
  {
    id: 'morgan',
    name: 'Morgan',
    role: 'Makes suggestions sound final',
    startsPresent: true,
    voice:
      'Confident social shorthand; treats a few nods as momentum, then has to hear objections.',
  },
  {
    id: 'gary',
    name: 'Gary',
    role: 'Has some historical context',
    startsPresent: true,
    voice:
      'Solemn ownership of irrelevant precedent; talks as though silence requested his expertise.',
  },
  {
    id: 'jordan',
    name: 'Jordan',
    role: 'Would like everyone included',
    startsPresent: true,
    voice:
      'Earnest, over-organises simple courtesies; makes useful compromises once given a boundary.',
  },
  {
    id: 'legal',
    name: 'Alex',
    role: 'Actually reads the menu',
    startsPresent: false,
    voice:
      'Quiet precision, restrained corrections; brings information, not an automatic solution.',
  },
  {
    id: 'vp',
    name: 'Pat',
    role: 'Senior enough to interrupt',
    startsPresent: false,
    voice:
      'Warm confidence, wants a recap; assumes a preference becomes simpler once they repeat it.',
  },
] satisfies readonly LunchAttendee[];
