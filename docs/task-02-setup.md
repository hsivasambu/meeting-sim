# Task 02: Vercel preview and LinkedIn probe

The public repository is [hsivasambu/meeting-sim](https://github.com/hsivasambu/meeting-sim).
Harry created the Vercel project and supplied a preview; its source commit still needs verification. The probe entry is `/probe.html` on the task 02 branch.

## Create the Vercel project

1. Open [New Project](https://vercel.com/new). Connect the GitHub account and grant the Vercel
   GitHub app access to **only** the `hsivasambu/meeting-sim` repository, then import it.
2. Use project name `meeting-sim`, Framework Preset **Vite**, root directory **.**, Node **24.x**,
   build command **pnpm build**, and output directory **dist**. No server functions are needed.
   These are the settings from the [technical spec](tech-spec.md#build-ci-and-deployment);
   Vercel documents [build settings](https://vercel.com/docs/builds/configure-a-build) and
   [Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).
3. Add `ENABLE_EXPERIMENTAL_COREPACK=1` to Preview and Production so Vercel uses the pinned
   `packageManager` version. Set the install command to
   `corepack pnpm install --frozen-lockfile`, then check the logs show pnpm 10.34.6.
   See [Vercel's Corepack instructions](https://vercel.com/docs/builds/configure-a-build#corepack).
4. Keep the production branch **main**. The first import builds the task 01 shell on main.
   To test task 02 without merging, create a **Preview** deployment from
   `chore/task-02-tests-probe`. In the project's Deployments view, use Create Deployment
   with that Git branch/ref, or let the GitHub integration build the task 02 PR.
   Verify the deployment's source branch/commit before testing.
   [Vercel's Git integration](https://vercel.com/docs/git/vercel-for-github) explains branch previews.
5. Ensure testers can open that preview inside LinkedIn. If it redirects to Vercel login,
   adjust the project's Deployment Protection for this diagnostic project/preview and save.
   Confirm the actual preview URL opens without a login wall on both phones.
   Disabling Vercel Authentication exposes existing deployments for that project;
   [the protection documentation](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication)
   explains its scope.
6. Open `https://<preview-host>/probe.html` in a regular browser first. It should show the
   probe heading, a visible PNG, the capability report and selectable fallback text.
   Provide the deployment URL/commit so the real-device evidence can be tied to that build.

## Run V1 on real devices

On an iPhone and an Android phone, send yourself the preview link through LinkedIn and open
it **inside the LinkedIn app**. Confirm the app did not hand the link to Safari/Chrome.
Record device, OS version, LinkedIn app version, date, preview URL and commit.

For each device:

- Confirm the page loads and the 1200×627 PNG appears. Record font/image-decode fields from
  the capability report. This probe uses the system font; the final pixel font lands later.
- Tap Share text and actually complete a share, then repeat and cancel.
- If Share PNG is enabled, complete a file share and verify the recipient sees the PNG.
  A true `canShare` result alone is not a pass.
- Tap Copy test text, paste elsewhere, and check it matches. If it fails, select/copy the
  fallback field and verify that path.
- Tap Download PNG, locate/open the saved image, and long-press the displayed image to test
  the alternate save route. Record both observed results separately.
- Record whether the share sheet/download leaves and returns to the page cleanly. Save the
  capability report and any defects without including personal messages or recipients.

Fill the evidence table in [ADR 0002](adr/0002-linkedin-capability-probe.md). Use **pass**,
**fail**, **unavailable**, or **not run**, and explain unavailable/failed actions.
Harry accepted task 02 with Android explicitly deferred; ADR 0002 records the risk and
capability-based share order. The Android release check remains required.
No game scoring, analytics, storage or event content is involved in this diagnostic.

## GitHub protection resolved

On October 11, Harry authorized public visibility. GitHub visibility is verified PUBLIC.
Main requires pull requests and the strict `quality` check, including administrators;
linear history is required, force pushes/deletions are disabled, and only squash merges
are allowed. The earlier private-repository HTTP 403 restriction is resolved.

## Supplied preview: access restored

Preview: https://meeting-e9pihcccd-hsivasambus-projects.vercel.app/probe.html

Reported main deployment: https://meeting-qzacf1hfe-hsivasambus-projects.vercel.app

Harry reports a LinkedIn redirect to Vercel login. Anonymous verification on October 11
returned HTTP 302 to Vercel SSO. In the Vercel project, open Deployment Protection,
turn off Vercel Authentication and Save. This exposes existing project deployments;
GitHub public visibility does not change this setting. Verify the preview opens in a
private browser window and confirm its source commit before repeating the real-device probe.

Latest October 11 follow-up: anonymous preview access returns HTTP 200. Harry reports
all probe tests passed on iOS and accepted task 02 with Android deferred as a risk in ADR 0002.
The initial authentication blocker above is historical and has been resolved.

## Local verification

On Windows, use the task 01 fnm setup, then:

```powershell
fnm exec --using 24 cmd /c corepack pnpm check
fnm exec --using 24 cmd /c corepack pnpm build
fnm exec --using 24 cmd /c corepack pnpm size
fnm exec --using 24 cmd /c corepack pnpm exec playwright install chromium webkit
fnm exec --using 24 cmd /c corepack pnpm e2e
```

Playwright runs the built Vite preview on Pixel 7 Chromium, iPhone 14 WebKit and desktop
Chromium. These checks validate the probe/fallback implementation; they do not substitute
for LinkedIn's in-app browser. Coverage thresholds activate with task 03 per the spec.
