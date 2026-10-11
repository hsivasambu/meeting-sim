import {
  assertBudget,
  measureBuild,
  JS_BUDGET,
  MEDIA_BUDGET,
} from './sizeBudget';

const result = await measureBuild('dist');
console.log(
  `JavaScript: ${result.javascript}/${JS_BUDGET} gzip bytes; images/fonts: ${result.media}/${MEDIA_BUDGET} bytes`,
);
assertBudget(result);
