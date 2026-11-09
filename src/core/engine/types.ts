import type {
  CALLBACK_DELAY,
  INITIAL_BOOKING_END,
  REDUCED_BOOKING_END,
} from './constants';

export type AttendeeId =
  'priya' | 'dev' | 'sam' | 'morgan' | 'gary' | 'jordan' | 'vp' | 'legal';
export type Rarity = 'common' | 'uncommon' | 'rare';
export type EventKind =
  'noise' | 'tangent' | 'substantive' | 'escalation' | 'gift' | 'callback';
export type Technique =
  'hear' | 'timebox' | 'park' | 'owner' | 'email' | 'refocus' | 'ack';

export interface Condition {
  readonly minMinute?: number;
  readonly maxMinute?: number;
  readonly present?: readonly AttendeeId[];
  readonly absent?: readonly AttendeeId[];
}
export interface Effect {
  readonly nominateCuisine?: CuisineId;
  readonly progress?: number;
  readonly minutes: number;
  readonly joins?: readonly AttendeeId[];
  readonly bookingEnd?: typeof REDUCED_BOOKING_END | typeof INITIAL_BOOKING_END;
  readonly callback?: {
    readonly eventId: string;
    readonly afterTurns: typeof CALLBACK_DELAY;
  };
}
export interface ResponseOutcome {
  readonly id: string;
  readonly weight: number;
  readonly effect: Effect;
  readonly line: string;
}
export interface Response {
  readonly id: string;
  readonly label: string;
  readonly technique: Technique;
  readonly requires?: Condition;
  readonly disabledReasonKey?: string;
  readonly description: string;
  readonly outcomes: readonly ResponseOutcome[];
}
export interface ExactFraction {
  readonly numerator: string;
  readonly denominator: string;
}
export interface EventVariant {
  readonly when: Condition;
  readonly speaker: AttendeeId | 'room';
  readonly line: string;
  readonly responses: readonly Response[];
}
export interface MeetingEvent {
  readonly id: string;
  readonly kind: EventKind;
  readonly rarity: Rarity;
  readonly speaker: AttendeeId | 'room';
  readonly line: string;
  readonly weight?: number;
  readonly negative?: boolean;
  readonly variants?: readonly EventVariant[];
  readonly when?: Condition;
  readonly responses: readonly Response[];
}
export interface PresentedEvent {
  readonly id: string;
  readonly kind: EventKind;
  readonly rarity: Rarity;
  readonly negative: boolean;
  readonly speaker: AttendeeId | 'room';
  readonly line: string;
  readonly responses: readonly Response[];
}
export interface DecisionRecord {
  readonly turn: number;
  readonly eventId: string;
  readonly responseId: string;
  readonly quality: number | null;
  readonly qualityFraction: {
    readonly numerator: string;
    readonly denominator: string;
  } | null;
}
export type LogEntry =
  | {
      readonly type: 'draw';
      readonly turn: number;
      readonly minute: number;
      readonly eventId: string;
      readonly speaker: AttendeeId | 'room';
    }
  | {
      readonly type: 'resolve';
      readonly turn: number;
      readonly minute: number;
      readonly eventId: string;
      readonly responseId: string;
      readonly technique: Technique;
      readonly line: string;
      readonly outcomeId: string;
      readonly commentaryId?: string;
    }
  | {
      readonly type: 'join';
      readonly turn: number;
      readonly minute: number;
      readonly who: AttendeeId;
    }
  | {
      readonly type: 'call-it';
      readonly turn: number;
      readonly minute: number;
    };
export interface DrawCandidate {
  readonly event: PresentedEvent;
  readonly probability: number;
}
export interface OutcomePreview {
  readonly outcomeId: string;
  readonly effect: Effect;
  readonly probabilityFraction: ExactFraction;
  readonly progressDelta: number;
  readonly minutesDelta: number;
  readonly personMinutesDelta: number;
  readonly utility: number;
  readonly utilityFraction: ExactFraction;
}
export type ResponsePreview =
  | {
      readonly enabled: false;
      readonly responseId: string;
      readonly reasonKey: string;
    }
  | {
      readonly enabled: true;
      readonly responseId: string;
      readonly outcomes: readonly OutcomePreview[];
      readonly expectedUtilityFraction: ExactFraction;
      readonly utility: number;
      readonly progressDelta: number;
      readonly minutesDelta: number;
      readonly personMinutesDelta: number;
    };
export interface ResponseSuccessor {
  readonly outcomeId: string;
  readonly probabilityFraction: ExactFraction;
  readonly state: MeetingState;
}
export interface ScoreBreakdown {
  readonly outcome: number;
  readonly efficiency: number;
  readonly decisions: number;
  readonly total: number;
}
export type LegacyTitleId =
  | 'inbox-zero'
  | 'efficient-facilitator'
  | 'ship-it-and-pray'
  | 'death-by-diligence'
  | 'skeleton-crew'
  | 'reply-all-royalty'
  | 'parking-lot-attendant'
  | 'gary-free-zone'
  | 'played-it-right'
  | 'take-this-offline'
  | 'calendar-criminal'
  | 'could-have-been-an-email';
export interface MeetingState {
  readonly seed: string;
  readonly turn: number;
  readonly minute: number;
  readonly bookingEnd: number;
  readonly progress: number;
  readonly personMinutes: number;
  readonly present: readonly AttendeeId[];
  readonly peakHeadcount: number;
  readonly seenEventIds: readonly string[];
  readonly spokenAttendeeIds: readonly AttendeeId[];
  readonly parkedCount: number;
  readonly substantiveDrawCount: number;
  readonly previousDrawWasUncommonNegative: boolean;
  readonly scheduled: readonly {
    readonly eventId: string;
    readonly dueTurn: number;
  }[];
  readonly current: PresentedEvent | null;
  readonly decisions: readonly DecisionRecord[];
  readonly log: readonly LogEntry[];
  readonly phase: 'running' | 'ended';
  readonly ending:
    'decision' | 'called-early' | 'time-expired' | 'cancelled' | null;
  readonly nominatedCuisine: CuisineId | null;
  readonly agreedCuisine: CuisineId | null;
  readonly resolvedCallbackCount: number;
  readonly shownCommentaryIds: readonly string[];
  readonly lastCommentaryTurn: number | null;
}

export type CuisineId = string;
export interface Cuisine {
  readonly id: CuisineId;
  readonly name: string;
}
export interface EventRules {
  readonly nominationEventId: string;
  readonly arrivalPermissions: readonly {
    readonly eventId: string;
    readonly responseId: string;
    readonly attendeeId: AttendeeId;
  }[];
  readonly arrivalAttendees: Readonly<Record<string, AttendeeId>>;
  readonly callbackTargets: Readonly<Record<string, string>>;
  readonly bookingEventIds: readonly string[];
}
export interface ContentPack {
  readonly eventRules: EventRules;
  readonly cuisines: readonly Cuisine[];
  readonly commentary: readonly LunchCommentary[];
  readonly events: readonly MeetingEvent[];
  readonly callbacks: readonly MeetingEvent[];
  readonly filler: MeetingEvent;
}
export interface LunchAttendee {
  readonly id: AttendeeId;
  readonly name: string;
  readonly role: string;
  readonly startsPresent: boolean;
  readonly voice: string;
}
export interface LunchTitle {
  readonly slot: number;
  readonly id: TitleId;
  readonly name: string;
  /** Review annotation; predicates are evaluated only by titleRules.ts. */
  readonly predicate: string;
  readonly flavour: string;
}
export interface LunchCommentary {
  readonly id:
    | 'agreement-commentary'
    | 'nearly-there'
    | 'full-room'
    | 'topic-returned'
    | 'expensive-discussion'
    | 'postponed-again'
    | 'still-considering';
  readonly priority: number;
  /** Review annotation for the engine-owned post-resolution predicate. */
  readonly predicate: string;
  readonly line: string;
}
export interface LunchCatalog {
  readonly revision: string;
  readonly attendees: readonly LunchAttendee[];
  readonly titles: readonly LunchTitle[];
  readonly commentary: readonly LunchCommentary[];
  readonly disabledReasons: Readonly<Record<string, string>>;
  readonly interfaceCopy: Readonly<Record<string, string>>;
  readonly epilogues: Readonly<Record<string, string>>;
  readonly moments: Readonly<Record<string, string>>;
  readonly parkTopics: Readonly<Record<string, string>>;
}
export type TitleId =
  | Exclude<
      LegacyTitleId,
      'ship-it-and-pray' | 'skeleton-crew' | 'gary-free-zone'
    >
  | 'lunch-agreed'
  | 'table-for-six'
  | 'second-helping';

export interface UtilityRules {
  readonly costWeight: number;
  readonly costUnit: number;
  readonly eventRules: EventRules;
  readonly cuisines: readonly Cuisine[];
  readonly commentary: readonly LunchCommentary[];
}
