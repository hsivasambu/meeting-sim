# ADR 0003: Simulation policy stream and shared limits

Status: Accepted by Harry on October 12, 2026 during task 08a review resolution.

Claude's review identified a policy RNG convention recorded only in code and
simulation assertions repeating engine constants. Harry explicitly selected
“Approve SHA-256 and ENGINE_LIMITS (recommended)” after reviewing the concrete
proposal. This authorizes the technical spec additions before final implementation.

Random's Node-only stream retains SHA-256 with UTF-8 keys
`${seed}:policy:random:${turn}:${counter}`, counter zero initially, first
big-endian uint32 ticket and rejection sampling before modulo selection from
authored enabled responses. It never consumes the engine draw RNG, which retains
the accepted cyrb53/mulberry32 algorithm. This preserves existing V3 choices and
the tested unbiased uniform policy while keeping engine RNG internals private.

The engine's public index gains one frozen readonly `ENGINE_LIMITS` object backed
by canonical constants. It exposes progress/risk caps, attendance bounds, decision
owner, booking endpoints, total score maximum and filler duration for invariant
assertions. The lint public-export allowlist adds this exact name; external callers
still use the index and do not gain access to engine internals. No game constants,
scoring formula, content effects, dependency or gate threshold change.

The technical spec remains the source of normative semantics. Its API and RNG
sections describe the contract; tests cover immutability and source correspondence,
and the simulation gate validates every policy run against the shared limits.
