# Task 03 contracts and RNG handoff

The engine public index exports the locked readonly types only. Runtime gameplay API
functions land in tasks 04–06; no placeholder behavior or live event content is supplied.
Internals receive ContentPack in those tasks. Synthetic packs in engine/fixtures are
independent of live content and can be frozen/serialized for later rules and goldens.

## Deterministic seed contract

cyrb53 uses hash seed zero and JavaScript UTF-16 code units, including surrogate pairs
and lone surrogates. The original 53-bit result is converted with unsigned right shift
zero to its low 32 bits, then passed to mulberry32. The state wraps to 32 bits on each
increment; samples are unsigned 32-bit words divided by 2^32, hence in [0, 1).
Each draw turn gets a fresh stream from seed + ':draw:' + turn. Call counts on earlier
turns cannot affect later turns. Algorithm coefficients are centralized, distinct from
future gameplay tuning, and fixed vectors lock the conversion and stream behavior.

Vector provenance: original published [cyrb53](https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js)
and [mulberry32](https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32), evaluated
independently before implementation tests. The newer cyrb53a variant is not used.

## Internal helpers

matchesCondition tests inclusive minimum/maximum minute/risk bounds and requires every
listed present/absent attendee condition. Omitted/empty conditions match. It reads
canonical state only, not narrative logs or scoring decisions. Requirements can be
rechecked after release without rerolling or rematerializing the pending presentation.

selectWeightedEvent takes an eligible unique-ID pool, one RNG function and injected
positive integer rarity weights. It multiplies each rarity weight by event weight
(default one), sorts by ASCII ID comparisons, computes floor(sample × total weight),
and picks the first cumulative sum strictly greater than that ticket. Invalid event
weights, unsafe/empty totals or RNG samples outside [0, 1) throw RangeError before a
selection is returned. Eligibility, variant materialization, scheduling and the public
getDrawCandidates distribution contract remain task 06 work.
Tests inject fixture weights instead of asserting live tuning. They cover every ticket,
representable boundary fractions and a decimal-rounding regression.

## Coverage activation

Vitest enforces at least 90% lines and 85% branches for src/core/**, including existing
shell/probe content and fixture packs. No existing core source is excluded. Pure type
modules have no executable coverage denominator. Browser probe helpers remain reported
outside core; the technical spec defines no coverage floor for them. An unimported
uncovered core file was deliberately introduced and rejected to verify the gate.
The same gate runs in pnpm check and the existing quality CI job.

Next task: 04. Android LinkedIn validation remains deferred under Harry's task 02
acceptance and must be completed before release (ADR 0002).
