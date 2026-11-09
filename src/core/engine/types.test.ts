import { expect, expectTypeOf, it } from 'vitest';
import type {
  ContentPack,
  Effect,
  MeetingState,
  PresentedEvent,
  ResponsePreview,
} from './index';
import { lunchPack, lunchState } from './fixtures/lunch';

it('exposes the locked readonly, serializable contracts through the public type surface', () => {
  expectTypeOf<
    MeetingState['current']
  >().toEqualTypeOf<PresentedEvent | null>();
  expectTypeOf<Effect['bookingEnd']>().toEqualTypeOf<45 | 60 | undefined>();
  expectTypeOf<
    NonNullable<Effect['callback']>['afterTurns']
  >().toEqualTypeOf<2>();
  expectTypeOf<Extract<ResponsePreview, { enabled: false }>>().toEqualTypeOf<{
    readonly enabled: false;
    readonly responseId: string;
    readonly reasonKey: string;
  }>();
  const pack: ContentPack = lunchPack;
  const state: MeetingState = lunchState();
  expect(JSON.parse(JSON.stringify(pack))).toEqual(pack);
  expect(JSON.parse(JSON.stringify(state))).toEqual(state);
});
