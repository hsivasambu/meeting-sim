import type { LegacyTitleId } from '../engine/types';

// The v1 archive must recognize these IDs after the launch catalog is replaced.
export const legacyTitleIds = [
  'inbox-zero',
  'efficient-facilitator',
  'ship-it-and-pray',
  'death-by-diligence',
  'skeleton-crew',
  'reply-all-royalty',
  'parking-lot-attendant',
  'gary-free-zone',
  'played-it-right',
  'take-this-offline',
  'calendar-criminal',
  'could-have-been-an-email',
] as const satisfies readonly LegacyTitleId[];
