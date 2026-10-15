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
  readonly minRisks?: number;
  readonly maxRisks?: number;
}
export interface Effect {
  readonly nominateCuisine?: CuisineId;
  readonly progress?: number;
  readonly minutes: number;
  readonly risks?: number;
  readonly joins?: readonly AttendeeId[];
  readonly bookingEnd?: typeof REDUCED_BOOKING_END | typeof INITIAL_BOOKING_END;
  readonly callback?: {
    readonly eventId: string;
    readonly afterTurns: typeof CALLBACK_DELAY;
  };
}
export interface Response {
  readonly id: string;
  readonly label: string;
  readonly technique: Technique;
  readonly requires?: Condition;
  readonly disabledReasonKey?: string;
  readonly effect: Effect;
  readonly line: string;
}
// Temporary launch defaults are removed at L08; outcome fixtures share the engine.
export interface ResponseOutcome {
  readonly id: string;
  readonly weight: number;
  readonly effect: Effect;
  readonly line: string;
}
export interface OutcomeResponse extends Omit<Response, 'effect' | 'line'> {
  readonly description: string;
  readonly outcomes: readonly ResponseOutcome[];
  readonly effect?: never;
  readonly line?: never;
}
export type EngineResponse = Response | OutcomeResponse;
export interface ExactFraction {
  readonly numerator: string;
  readonly denominator: string;
}
export interface EventVariant<R extends EngineResponse = Response> {
  readonly when: Condition;
  readonly speaker: AttendeeId | 'room';
  readonly line: string;
  readonly responses: readonly R[];
}
export interface MeetingEvent<R extends EngineResponse = Response> {
  readonly id: string;
  readonly kind: EventKind;
  readonly rarity: Rarity;
  readonly speaker: AttendeeId | 'room';
  readonly line: string;
  readonly weight?: number;
  readonly negative?: boolean;
  readonly variants?: readonly EventVariant<R>[];
  readonly when?: Condition;
  readonly responses: readonly R[];
}
export interface PresentedEvent<R extends EngineResponse = Response> {
  readonly id: string;
  readonly kind: EventKind;
  readonly rarity: Rarity;
  readonly negative: boolean;
  readonly speaker: AttendeeId | 'room';
  readonly line: string;
  readonly responses: readonly R[];
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
      readonly outcomeId?: string;
    }
  | {
      readonly type: 'release';
      readonly turn: number;
      readonly minute: number;
      readonly who: AttendeeId;
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
export type ResponsePreview =
  | {
      readonly enabled: false;
      readonly responseId: string;
      readonly reasonKey: string;
    }
  | {
      readonly enabled: true;
      readonly responseId: string;
      readonly effect: Effect;
      readonly progressDelta: number;
      readonly risksDelta: number;
      readonly minutesDelta: number;
      readonly personMinutesDelta: number;
      readonly utility: number;
    };
export interface DrawCandidate<R extends EngineResponse = Response> {
  readonly event: PresentedEvent<R>;
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
export type OutcomeResponsePreview =
  | Extract<ResponsePreview, { enabled: false }>
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
export interface ResponseSuccessor<R extends EngineResponse = Response> {
  readonly outcomeId: string;
  readonly probabilityFraction: ExactFraction;
  readonly state: MeetingState<R>;
}
export type ReleasePreview =
  | { readonly enabled: true }
  | {
      readonly enabled: false;
      readonly reasonKey:
        'release-owner' | 'release-absent' | 'release-minimum';
    };
export interface ScoreBreakdown {
  readonly outcome: number;
  readonly efficiency: number;
  readonly decisions: number;
  readonly total: number;
}
export type TitleId =
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
export interface EventRules {
  readonly arrivalAttendees: Readonly<Record<string, AttendeeId>>;
  readonly callbackTargets: Readonly<Record<string, string>>;
  readonly bookingEventIds: readonly string[];
}
export interface ContentPack<
  R extends EngineResponse = Response,
  Rules = EventRules,
> {
  readonly eventRules: Rules;
  readonly events: readonly MeetingEvent<R>[];
  readonly callbacks: readonly MeetingEvent<R>[];
  readonly filler: MeetingEvent<R>;
}
export interface SharedMeetingState<R extends EngineResponse = Response> {
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
  readonly current: PresentedEvent<R> | null;
  readonly decisions: readonly DecisionRecord[];
  readonly log: readonly LogEntry[];
  readonly phase: 'running' | 'ended';
  readonly ending:
    'decision' | 'called-early' | 'time-expired' | 'cancelled' | null;
}

export interface MeetingState<
  R extends EngineResponse = Response,
> extends SharedMeetingState<R> {
  readonly risks: number;
  readonly releasedAttendeeIds: readonly AttendeeId[];
}

// Temporary fixture-injected migration profile; L08 removes the launch schema.
export type CuisineId = string;
export interface Cuisine {
  readonly id: CuisineId;
  readonly name: string;
}
export interface LunchState extends SharedMeetingState<OutcomeResponse> {
  readonly nominatedCuisine: CuisineId | null;
  readonly agreedCuisine: CuisineId | null;
  readonly resolvedCallbackCount: number;
  readonly shownCommentaryIds: readonly string[];
  readonly lastCommentaryTurn: number | null;
}
export type EngineState = MeetingState<EngineResponse> | LunchState;
export interface LunchEventRules {
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
export interface LunchContentPack extends ContentPack<
  OutcomeResponse,
  LunchEventRules
> {
  readonly cuisines: readonly Cuisine[];
}
export type LunchTitleId =
  | Exclude<TitleId, 'ship-it-and-pray' | 'skeleton-crew' | 'gary-free-zone'>
  | 'lunch-agreed'
  | 'table-for-six'
  | 'second-helping';

export interface LaunchUtilityRules {
  readonly profile?: 'launch';
  readonly costWeight: number;
  readonly riskWeight: number;
  readonly costUnit: number;
  readonly eventRules?: EventRules;
}
export interface LunchUtilityRules {
  readonly profile: 'lunch';
  readonly costWeight: number;
  readonly costUnit: number;
  readonly eventRules: LunchEventRules;
  readonly cuisines: readonly Cuisine[];
}
export type UtilityRules = LaunchUtilityRules | LunchUtilityRules;
