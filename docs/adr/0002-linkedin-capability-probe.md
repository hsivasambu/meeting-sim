# ADR 0002: LinkedIn capability probe evidence (V1)

Status: Evidence pending; no share-order decision is accepted yet.
Task: 02c. Recorded October 11, 2026.
Baseline: D19/D26 in [ADR 0001](0001-stack.md); see
[setup and test procedure](../task-02-setup.md).

The isolated `/probe.html` page tests approved browser capabilities only. It exports
a runtime PNG, waits for the Font Loading API when available, checks image decode,
offers file/text native sharing, clipboard write, anchor download and a permanently
selectable text fallback. It displays the image for long-press save.
API support is reported separately from attempted-operation results.
Share-sheet cancellation has its own outcome and never becomes a game failure.

## Automated evidence

- Local built-preview tests: 18 checks passed across the three required Playwright projects.
- PNG signature/download, image visibility, 320 px fit, clipboard denial, absent optional
  APIs and native-share cancellation were verified.
- Unit/property runner: 10 tests passed, including deterministic fast-check size-budget cases.
- Hosted [quality run](https://github.com/hsivasambu/meeting-sim/actions/runs/38174153522) passed on commit `0989b78`; its published unit/coverage/Playwright reports were downloaded and verified. Hosted E2E: 18 passes, zero skipped, flaky or unexpected outcomes.
- These are browser emulations/mocks. No real LinkedIn result is inferred from them.

## Hosting evidence — October 11, 2026

Harry supplied the [probe preview](https://meeting-e9pihcccd-hsivasambus-projects.vercel.app/probe.html)
and reported a LinkedIn redirect to Vercel login. Device/OS/version were not supplied;
this observation is not attributed to either platform below. Anonymous HTTP verification
returned 302 to Vercel SSO. Capability checks remain blocked by Deployment Protection;
no capability success or failure is inferred. The deployed commit remains unverified.

## Real-device evidence

| Evidence                               | iOS LinkedIn in-app browser  | Android LinkedIn in-app browser |
| -------------------------------------- | ---------------------------- | ------------------------------- |
| Device / OS / LinkedIn version         | Not run                      | Not run                         |
| Date / preview URL / commit            | URL supplied; commit pending | URL supplied; commit pending    |
| Page load / fonts ready / image decode | Not run                      | Not run                         |
| Native text share / cancellation       | Not run                      | Not run                         |
| Native PNG share / recipient image     | Not run                      | Not run                         |
| Clipboard write / selectable fallback  | Not run                      | Not run                         |
| Download / long-press save             | Not run                      | Not run                         |
| Leaves and returns cleanly / defects   | Not run                      | Not run                         |

## Decision to record after the probe

Record which working path should be offered first on each observed platform, keeping
image/download/selectable-text fallbacks. Until both reports exist, the final game's
sharing order remains undecided; task 02 is not fully accepted.
