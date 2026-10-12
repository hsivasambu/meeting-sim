import type { AttendeeId } from '../engine/types';

export const attendees = [
  {
    id: 'priya',
    name: 'Priya',
    role: 'Chief Decision Enablement Officer',
    topic: 'Decision owner',
  },
  {
    id: 'dev',
    name: 'Dev',
    role: 'Principal Engineer, Velocity & Vibes',
    topic: 'Engineering',
  },
  {
    id: 'sam',
    name: 'Sam',
    role: 'Head of Customer Happiness Escalations',
    topic: 'Support',
  },
  {
    id: 'morgan',
    name: 'Morgan',
    role: 'VP, Synergistic Storytelling',
    topic: 'Marketing',
  },
  {
    id: 'gary',
    name: 'Gary',
    role: 'Senior Strategic Scope Architect',
    topic: 'Scope (comic)',
  },
  {
    id: 'jordan',
    name: 'Jordan',
    role: 'Cross-Functional FYI Liaison',
    topic: 'FYI (comic)',
  },
  {
    id: 'vp',
    name: 'The VP',
    role: 'Executive Vice President of Dropping In',
    topic: 'Escalation',
  },
  {
    id: 'legal',
    name: 'Legal',
    role: 'Associate General Counsel, Risk Appetite',
    topic: 'Escalation',
  },
] as const satisfies readonly {
  readonly id: AttendeeId;
  readonly name: string;
  readonly role: string;
  readonly topic: string;
}[];
