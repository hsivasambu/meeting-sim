// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { Cuisine } from '../../engine/types';
export const cuisines = [
  {
    id: 'italian',
    name: 'Italian',
  },
  {
    id: 'mexican',
    name: 'Mexican',
  },
  {
    id: 'thai',
    name: 'Thai',
  },
] satisfies readonly Cuisine[];
