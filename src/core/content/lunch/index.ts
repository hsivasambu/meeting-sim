// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
import type { LunchContentPack, LunchCatalog } from '../../engine/types';
import { event as nominate_cuisine } from './events/nominate-cuisine';
import { event as menu_needs } from './events/menu-needs';
import { event as lunch_window } from './events/lunch-window';
import { event as portion_plan } from './events/portion-plan';
import { event as quick_agreement } from './events/quick-agreement';
import { event as projector } from './events/projector';
import { event as introductions } from './events/introductions';
import { event as soup_debate } from './events/soup-debate';
import { event as lunch_history } from './events/lunch-history';
import { event as lunch_committee } from './events/lunch-committee';
import { event as chair_arrangement } from './events/chair-arrangement';
import { event as spice_question } from './events/spice-question';
import { event as alex_arrives } from './events/alex-arrives';
import { event as pat_arrives } from './events/pat-arrives';
import { event as room_booked } from './events/room-booked';
import { event as menu_read } from './events/menu-read';
import { event as small_concession } from './events/small-concession';
import { event as menu_return } from './events/menu-return';
import { event as soup_return } from './events/soup-return';
import { event as spice_return } from './events/spice-return';
import { event as filler } from './events/filler';
import { engineRules } from './engineRules';
import { cuisines } from './cuisines';
import { attendees } from './attendees';
import { titles } from './titles';
import { commentary } from './commentary';
import {
  disabledReasons,
  interfaceCopy,
  epilogues,
  moments,
  parkTopics,
} from './copy';
export const lunchContentPack = {
  eventRules: engineRules,
  cuisines,
  events: [
    nominate_cuisine,
    menu_needs,
    lunch_window,
    portion_plan,
    quick_agreement,
    projector,
    introductions,
    soup_debate,
    lunch_history,
    lunch_committee,
    chair_arrangement,
    spice_question,
    alex_arrives,
    pat_arrives,
    room_booked,
    menu_read,
    small_concession,
  ],
  callbacks: [menu_return, soup_return, spice_return],
  filler,
} satisfies LunchContentPack;
export const lunchCatalog = {
  revision: 'lunch-l02b-reviewed-2',
  attendees,
  titles,
  commentary,
  disabledReasons,
  interfaceCopy,
  epilogues,
  moments,
  parkTopics,
} satisfies LunchCatalog;
