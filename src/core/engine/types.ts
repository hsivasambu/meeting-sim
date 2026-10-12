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
export interface DrawCandidate {
  readonly event: PresentedEvent;
  readonly probability: number;
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
export interface ContentPack {
  readonly eventRules: EventRules;
  readonly events: readonly MeetingEvent[];
  readonly callbacks: readonly MeetingEvent[];
  readonly filler: MeetingEvent;
}
export interface MeetingState {
  readonly seed: string;
  readonly turn: number;
  readonly minute: number;
  readonly bookingEnd: number;
  readonly progress: number;
  readonly risks: number;
  readonly personMinutes: number;
  readonly present: readonly AttendeeId[];
  readonly releasedAttendeeIds: readonly AttendeeId[];
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
}

export interface UtilityRules {
  readonly costWeight: number;
  readonly riskWeight: number;
  readonly costUnit: number;
  readonly eventRules?: EventRules;
}
