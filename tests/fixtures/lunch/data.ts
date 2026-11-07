import {
  lunchContentPack as pack,
  lunchCatalog,
} from '../../../src/core/content/lunch/index';
import { event as quickAgreement } from '../../../src/core/content/lunch/events/quick-agreement';
import { event as menuNeeds } from '../../../src/core/content/lunch/events/menu-needs';
import { W_COST, UTILITY_COST_PM } from '../../../src/core/engine/constants';
import { drawEventWith } from '../../../src/core/engine/draw';
import { previewWithRules } from '../../../src/core/engine/preview';
import { resolveWithRules } from '../../../src/core/engine/resolve';
import { score } from '../../../src/core/engine/score';
import { callIt, initialLunchState } from '../../../src/core/engine/state';
import { earnedLunchTitles } from '../../../src/core/engine/titleRules';
import type {
  LunchState,
  LunchUtilityRules,
} from '../../../src/core/engine/types';
import type { LunchFrame } from '../../../src/ui/screens/lunch/MeetingScreen';
import type { LunchResult } from '../../../src/ui/screens/lunch/ResultsScreen';
import type { LunchChoice } from '../../../src/ui/screens/lunch/presentation';
import type { FixtureTurn } from './types';

const rules = {
  profile: 'lunch',
  costWeight: W_COST,
  costUnit: UTILITY_COST_PM,
  eventRules: pack.eventRules,
  cuisines: pack.cuisines,
} satisfies LunchUtilityRules;

function resultFor(game: LunchState): LunchResult {
  if (game.ending === null) throw new Error('Expected ended lunch fixture');
  const breakdown = score(game);
  const titleId = earnedLunchTitles(game, breakdown)[0];
  const title = lunchCatalog.titles.find((entry) => entry.id === titleId)?.name;
  const summary = {
    breakdown,
    minute: game.minute,
    personMinutes: game.personMinutes,
    peakHeadcount: game.peakHeadcount,
    log: game.log,
    ...(title === undefined ? {} : { title }),
  };
  if (game.ending !== 'decision')
    return {
      ...summary,
      ending: game.ending,
      nominatedCuisine: game.nominatedCuisine,
    };
  if (game.agreedCuisine === null) throw new Error('Expected agreed cuisine');
  return { ...summary, ending: game.ending, agreedCuisine: game.agreedCuisine };
}

function hudFor(game: LunchState): LunchFrame['hud'] {
  return {
    progress: game.progress,
    minute: game.minute,
    bookingEnd: game.bookingEnd,
    personMinutes: game.personMinutes,
    nominatedCuisine: game.nominatedCuisine,
  };
}

function fixtureTurn(game: LunchState, includeNextDraw: boolean): FixtureTurn {
  const event = game.current;
  if (event === null) throw new Error('Expected presented lunch event');
  const choices = event.responses.map((response): LunchChoice => {
    const preview = previewWithRules(game, response, rules);
    const { id, label, description } = response;
    const choice = { id, label, description };
    return preview.enabled
      ? { ...choice, enabled: true }
      : { ...choice, enabled: false, reasonKey: preview.reasonKey };
  });
  return {
    frame: {
      id: `${game.turn}-draw`,
      hud: hudFor(game),
      present: game.present,
      speaker: event.speaker,
      line: event.line,
      choices,
    },
    called: resultFor(callIt(game)),
    outcomes: choices
      .filter((choice) => choice.enabled)
      .map((choice) => {
        const after = resolveWithRules(game, choice.id, rules);
        const resolution = after.log
          .slice(game.log.length)
          .find((entry) => entry.type === 'resolve');
        if (resolution === undefined)
          throw new Error('Expected resolved branch');
        const next =
          after.ending !== null
            ? resultFor(after)
            : includeNextDraw
              ? fixtureTurn(drawEventWith(pack, after), false)
              : null;
        return {
          responseId: choice.id,
          frame: {
            id: `${game.turn}-resolve`,
            hud: hudFor(after),
            present: after.present,
            speaker: event.speaker,
            line: resolution.line,
            choices: [],
            // Exercise formatting of a supplied commentary ID. Selection belongs to activation.
            ...(after.agreedCuisine === null
              ? {}
              : {
                  agreedCuisine: after.agreedCuisine,
                  commentaryId: 'agreement-commentary',
                }),
          },
          next,
        };
      }),
  };
}

export function nominationFixture(): FixtureTurn {
  return fixtureTurn(
    drawEventWith(pack, initialLunchState('l07-nomination')),
    true,
  );
}

export function branchFixture(seed: string, cuisine: string): FixtureTurn {
  const nominated = resolveWithRules(
    drawEventWith(pack, initialLunchState(seed)),
    cuisine,
    rules,
  );
  // Isolate the same presentation just before the deadline with Pat already present.
  const nearDeadline = {
    ...nominated,
    progress: 90,
    minute: 55,
    personMinutes: 330,
    present: [...nominated.present, 'vp'],
    peakHeadcount: 7,
  } satisfies LunchState;
  return fixtureTurn(
    drawEventWith({ ...pack, events: [quickAgreement] }, nearDeadline),
    false,
  );
}

export function menuFixture(): FixtureTurn {
  const nominated = resolveWithRules(
    drawEventWith(pack, initialLunchState('l07-menu')),
    'italian',
    rules,
  );
  return fixtureTurn(
    drawEventWith({ ...pack, events: [menuNeeds] }, nominated),
    true,
  );
}
