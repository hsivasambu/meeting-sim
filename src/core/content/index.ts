import type { ContentPack } from '../engine/types';
import { engineRules } from './engineRules';
import { hdmi } from './events/hdmi';
import { tvNoSignal } from './events/tv-no-signal';
import { intros } from './events/intros';
import { scopeRevisit } from './events/scope-revisit';
import { unrelatedQ } from './events/unrelated-q';
import { anotherMeeting } from './events/another-meeting';
import { circleBack } from './events/circle-back';
import { whereWeStand } from './events/where-we-stand';
import { supportTraining } from './events/support-training';
import { failingTests } from './events/failing-tests';
import { pressDate } from './events/press-date';
import { p1Bug } from './events/p1-bug';
import { legal } from './events/legal';
import { vpJoins } from './events/vp-joins';
import { roomBooked } from './events/room-booked';
import { preRead } from './events/pre-read';
import { aligned } from './events/aligned';
import { circleBackReturn } from './events/circle-back-return';
import { supportFollowUp } from './events/support-follow-up';
import { p1FollowUp } from './events/p1-follow-up';
import { filler } from './events/filler';

export { engineRules } from './engineRules';
export const contentPack = {
  eventRules: engineRules,
  events: [
    hdmi,
    tvNoSignal,
    intros,
    scopeRevisit,
    unrelatedQ,
    anotherMeeting,
    circleBack,
    whereWeStand,
    supportTraining,
    failingTests,
    pressDate,
    p1Bug,
    legal,
    vpJoins,
    roomBooked,
    preRead,
    aligned,
  ],
  callbacks: [circleBackReturn, supportFollowUp, p1FollowUp],
  filler,
} as const satisfies ContentPack;
