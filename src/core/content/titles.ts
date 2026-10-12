import type { TitleId } from '../engine/types';

export const titles = [
  {
    id: 'inbox-zero',
    name: 'Inbox Zero',
  },
  {
    id: 'efficient-facilitator',
    name: 'Efficient Facilitator',
  },
  {
    id: 'ship-it-and-pray',
    name: 'Ship It and Pray',
  },
  {
    id: 'death-by-diligence',
    name: 'Death by Diligence',
  },
  {
    id: 'skeleton-crew',
    name: 'Skeleton Crew',
  },
  {
    id: 'reply-all-royalty',
    name: 'Reply-All Royalty',
  },
  {
    id: 'parking-lot-attendant',
    name: 'Parking Lot Attendant',
  },
  {
    id: 'gary-free-zone',
    name: 'Gary-Free Zone',
  },
  {
    id: 'played-it-right',
    name: 'Played It Right, Lost Anyway',
  },
  {
    id: 'take-this-offline',
    name: "Let's Take This Offline",
  },
  {
    id: 'calendar-criminal',
    name: 'Calendar Criminal',
  },
  {
    id: 'could-have-been-an-email',
    name: "This Could've Been an Email",
  },
] as const satisfies readonly { readonly id: TitleId; readonly name: string }[];
