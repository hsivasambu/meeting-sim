import { expect, expectTypeOf, it } from 'vitest';
import type {
  ContentPack,
  Effect,
  MeetingState,
  PresentedEvent,
  ResponsePreview,
} from './index';
import { fixturePack, fixtureState } from './fixtures/packs';

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
  const pack: ContentPack = fixturePack;
  const state: MeetingState = fixtureState;
  expect(JSON.parse(JSON.stringify(pack))).toEqual(pack);
  expect(JSON.parse(JSON.stringify(state))).toEqual(state);
});
