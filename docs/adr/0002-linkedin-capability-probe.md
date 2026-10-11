# ADR 0002: LinkedIn capability probe evidence (V1)

Status: Accepted for task 02 with Harry's explicit Android evidence deferral.
Task: 02c. Recorded October 11, 2026.
Baseline: D19/D26 in [ADR 0001](0001-stack.md); see [setup procedure](../task-02-setup.md).

The isolated probe tests runtime PNG rendering, font readiness, image decode, file/text
native sharing, clipboard, download, long-press save and persistent selectable text.
API support and actual outcomes are distinct; cancellation has a separate outcome.

## Automated evidence

- 10 unit/property tests passed, including seeded fast-check budget cases.
- 18 built-preview E2E checks passed on Pixel 7 Chromium, iPhone 14 WebKit and desktop Chromium.
  PNG download/signature, image visibility, 320 px fit, absent APIs, denied clipboard and
  cancelled share behavior are covered. Every test rejects console errors/exceptions.
- Hosted [quality run](https://github.com/hsivasambu/meeting-sim/actions/runs/38175379739)
  passed on commit bfd0918; Vercel reported a successful PR deployment for that head.
- Earlier hosted [reports](https://github.com/hsivasambu/meeting-sim/actions/runs/38174153522)
  were downloaded and verified: 10 unit passes, 18 E2E passes, zero skipped/flaky/unexpected.
- Emulation and mocks do not establish real Android behavior.

## Hosting evidence

Harry supplied the [probe preview](https://meeting-e9pihcccd-hsivasambus-projects.vercel.app/probe.html).
Initially LinkedIn redirected to Vercel login; anonymous access returned HTTP 302 to SSO.
On October 11 follow-up, anonymous access returned HTTP 200, resolving the login blocker.
The exact tested deployment commit was not supplied. Vercel's successful PR deployment
is separate evidence, not proof of that URL's commit.

## Real-device evidence — October 11, 2026

Harry reports: "OK tested on a device, all tests passed the probe. Wrap up Task 02."
He identified iOS as the tested platform and explicitly instructed:
"Just test iOS, I don't have an android. Move forward anyway, note it as a risk."
These are user-reported outcomes, not independently witnessed by the assistant.
Model, OS/LinkedIn versions, raw report and exact tested commit were not supplied.

| Evidence                               | iOS LinkedIn in-app browser                  | Android LinkedIn in-app browser |
| -------------------------------------- | -------------------------------------------- | ------------------------------- |
| Device / OS / LinkedIn version         | iOS; model/versions not supplied             | Not tested; no device available |
| Date / preview URL / commit            | October 11; preview above; commit unverified | Not tested                      |
| Page load / fonts ready / image decode | Pass, per full-probe report                  | Not tested                      |
| Native text share / cancellation       | Pass, per full-probe report                  | Not tested                      |
| Native PNG share / recipient image     | Pass, per full-probe report                  | Not tested                      |
| Clipboard write / selectable fallback  | Pass, per full-probe report                  | Not tested                      |
| Download / long-press save             | Pass, per full-probe report                  | Not tested                      |
| Leaves and returns cleanly / defects   | Pass; no defects reported                    | Not tested                      |

## Acceptance, sharing order and outstanding risk

Task 02 is accepted on the iOS result and automated evidence. Harry explicitly deferred
the task 02 criterion requiring Android evidence because no device is available.
This is a documented evidence exception, not an Android pass or a weakened automated gate.
The technical spec's iOS/Android manual release checklist remains in force.

For the later share UI, retain the spec's capability-based order: offer native PNG
sharing when canShare permits files, with download and copy text fallbacks. Always show
the image for long-press save and retain selectable text when clipboard access fails.
The iOS report supports this order; no Android-specific order is established.

Risk: Android LinkedIn share, clipboard, save and return behavior remain unverified.
Run the same real-device procedure when Android access becomes available and before
release, record metadata/results here, and revisit the share order if observed behavior
conflicts. Supplement iOS metadata/build attribution when available. No task 03 work
is included in this decision.
