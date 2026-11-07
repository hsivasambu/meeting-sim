// Approved docs/content-table.md — lunch-l02b-reviewed-2; L05 injection only until L08.
export const disabledReasons = {
  'alex-present':
    'Alex is already here. Use the menu discussion rather than inviting Alex twice.',
  'pat-present':
    'Pat is already here. A second invitation would only encourage a second recap.',
  'alex-absent': 'Alex has not joined. You can still check the menu together.',
  'pat-absent':
    'Pat has not joined. Choose an option the people here can carry out.',
} satisfies Readonly<Record<string, string>>;
export const interfaceCopy = {
  'product-title': "This Could've Been an Email",
  objective: 'Agree on a cuisine for lunch.',
  premise: 'Six adults. One lunch. Apparently this needs a meeting.',
  start: 'Start',
  loading: 'Booking the room…',
  'load-failed':
    'The room did not load. Lunch is not being delayed for a dramatic entrance.',
  retry: 'Retry',
  meeting: 'The lunch meeting',
  'instructions-action':
    'Suggest a cuisine, then help the room agree. Time moves when you choose a response.',
  'instructions-cost':
    'Everyone stays. Extra colleagues make later discussion more expensive.',
  'instructions-chance':
    'Some choices can turn out differently. Their descriptions explain the possible setback.',
  keyboard: 'Enter: show choices or continue. 1–3: choose a response.',
  'show-choices': 'Show choices',
  continue: 'Continue',
  'call-it': 'Call it',
  'call-it-description': 'End the discussion without agreement.',
  roster: 'In the room',
  'room-speaker': 'The room',
  'room-accessible': 'In the lunch meeting: {roster}.',
  progress: 'Agreement progress',
  minutes: 'Minutes discussed',
  booking: 'Booking ends at minute',
  remaining: 'Minutes remaining',
  cost: 'Discussion cost',
  'cost-explanation':
    'Salary time spent discussing lunch, not the price of food.',
  'considering-empty': 'No cuisine suggested yet',
  considering: 'Considering: {cuisine}',
  headcount: 'Adults present',
  'peak-headcount': 'Most adults present',
  postponed: 'Topics postponed',
  results: 'Results',
  score: 'Score',
  'outcome-component': 'Agreement',
  'efficiency-component': 'Cost efficiency',
  'decisions-component': 'Choices',
  'choices-explanation':
    'Choices scores the expected benefit and cost when you chose, before the outcome was known.',
  'actual-explanation':
    'Agreement and cost reflect what actually happened. A setback need not mean a bad choice.',
  'success-result': 'Agreed: {agreedCuisine}',
  'success-summary': 'Everyone present agreed on {agreedCuisine}.',
  'failure-result': 'No agreement',
  'failure-nomination': 'Suggested: {cuisine}. Not agreed.',
  'failure-no-nomination': 'No cuisine was nominated.',
  'ended-decision': 'Agreed: {agreedCuisine}',
  'ended-called-early': 'Discussion ended early. No agreement.',
  'ended-time-expired': 'Booking expired. No agreement.',
  'ended-cancelled': 'Meeting cancelled. No agreement.',
  'fallback-decision-heading': 'Agreed: {agreedCuisine}',
  'fallback-failure-heading': 'No agreement',
  moment: 'Meeting moment',
  replay: 'Play again',
  'current-collection': 'Lunch collection',
  'legacy-collection': 'Launch meeting collection',
  'legacy-explanation':
    'Awards from the original launch meeting. They do not fill the lunch collection.',
  'collection-count': '{unlocked} of 12 lunch titles',
  'locked-title': 'Not yet earned',
  'newly-earned': 'New title earned: {title}',
  share: 'Share result',
  download: 'Download image',
  'copy-text': 'Copy text',
  copied: 'Text copied',
  'clipboard-fallback':
    'Copy the text below. The clipboard has declined the invitation.',
  'save-image': 'Press and hold the image to save it.',
  'share-unavailable':
    'File sharing is unavailable here. You can save the image or copy the text.',
  'share-failed':
    'Sharing did not finish. You can still save the image or copy the text.',
  'share-success':
    "We agreed on {agreedCuisine} in This Could've Been an Email.",
  'share-early':
    "No lunch agreement. I ended the discussion in This Could've Been an Email.",
  'share-expired':
    "No lunch agreement. The room booking expired in This Could've Been an Email.",
  'share-cancelled':
    "No lunch agreement. I cancelled the meeting in This Could've Been an Email.",
  'share-nomination': 'Suggested: {cuisine}. Not agreed.',
  'share-score': 'Score: {score}/1000',
  'share-time': 'Discussion: {minute} minutes',
  'share-cost': 'Salary cost: {cost}',
  'share-peak': 'Peak attendance: {headcount} adults',
  'share-seed': 'Seed: {seed}',
  'share-revision': 'Rules/content: {revision}',
  'replay-caveat':
    'Replay needs the same revision, seed and actions. Seeds may differ in difficulty.',
  error: 'The meeting hit a problem. Start a new meeting to try again.',
  'error-restart': 'Start a new meeting',
} satisfies Readonly<Record<string, string>>;
export const epilogues = {
  decision:
    'Everyone present agrees on {agreedCuisine}. Please let the next conversation be over lunch.',
  'called-early':
    'No agreement. The discussion ends; the lunch suggestion remains a suggestion.',
  'time-expired':
    'No agreement. The next team gets the room and inherits none of our lunch expertise.',
  cancelled:
    'No agreement. This could have been an email. There is still time to make it one.',
} satisfies Readonly<Record<string, string>>;
export const moments = {
  'first-postponed':
    'Postponed at minute {minute}: {topic}. The notes will remember.',
  'first-arrival':
    '{attendee} joined at minute {minute}. The discussion now has another participant.',
  'decision-fallback':
    'The room agreed on {agreedCuisine}. Nobody needed a follow-up to identify lunch.',
  'early-fallback':
    'The discussion stopped before agreement. The suggestion is still only a suggestion.',
  'expiry-fallback':
    'No cuisine was agreed before the booking ended. The next team would like its room.',
  'cancel-fallback':
    'No discussion resolved. No cuisine agreed. Just an available email subject.',
} satisfies Readonly<Record<string, string>>;
export const parkTopics = {
  'menu-needs / park': 'meal options',
  'projector / park': 'big screen',
  'soup-debate / park': 'soup debate',
  'lunch-committee / park': 'lunch committee',
  'spice-question / park': 'spice preference',
  'pat-arrives / park': "Pat's questions",
} satisfies Readonly<Record<string, string>>;
