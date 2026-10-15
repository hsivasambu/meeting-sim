# Task 12a — text-only V4 playtest

Status: **V4 accepted by Harry on October 15, 2026; task 12a complete.**
See [the acceptance record](task-12a-v4-acceptance.md) for his exact instruction.
Individual report rows below remain historical unsupplied data, not fabricated results.
Harry agreed on October 12, 2026 to play and recruit two other people.
That agreement is not a recorded playtest result.

Open [the hosted text-only preview](https://meeting-sim-git-feat-task-12a-text-loop-hsivasambus-projects.vercel.app/)
on any tester's device. It is the task 12a branch deployment from
[draft PR #15](https://github.com/hsivasambu/meeting-sim/pull/15); anonymous HTTP
access was verified with status 200 on October 12, 2026. Deployment success and
anonymous page access do not establish a human playtest result.

The current local built preview is running at <http://127.0.0.1:4174/> on this computer.
The same computer can be used by all three testers. This address is local; it
does not open the build on another person's device.

To restart the preview in PowerShell:

```powershell
Set-Location C:\dev\meeting-sim
$env:Path = "C:\Users\hsiva\AppData\Roaming\fnm\node-versions\v24.21.0\installation;$env:Path"
pnpm build
pnpm preview --host 127.0.0.1 --port 4174 --strictPort
```

Keep the preview terminal running, then open the address above in a browser.

Harry should play several runs. Then let two other people try the game without
coaching or an explanation of its goal. At 15 seconds, ask them to describe the
goal. After a run, ask which issues mattered to Friday's launch and which were
tangents. Record their words and any confusing event lines or controls. Avoid
explaining the distinction before they answer.

For Harry's control check: Start → Show choices → response → outcome → Continue.
Tap an attendee name to confirm release or Cancel; Priya and the last other
attendee show refusal reasons. Call it ends a run, and Play again returns to Start.
Enter reveals choices or continues after an outcome; 1–3 chooses a response.
There is no animation in this slice. Reading and releasing do not advance time.

| Tester   | Goal understood within 15 seconds / exact answer | Substantive versus tangent examples | Confusing lines or controls | Findings / follow-up |
| -------- | ------------------------------------------------ | ----------------------------------- | --------------------------- | -------------------- |
| Harry    | Pending                                          | Pending                             | Pending                     | Pending              |
| Person 2 | Pending                                          | Pending                             | Pending                     | Pending              |
| Person 3 | Pending                                          | Pending                             | Pending                     | Pending              |

Record device/browser and approximate run count with each report. Feed observed
content issues into `docs/content-table.md` before tuning. Do not infer human
understanding from automated browser tests or change event designs without the
existing content review process. Once all three reports and resulting follow-ups
are recorded, close task 12a in the implementation plan. The next blueprint task
is 08b; no work on that task belongs in this slice.
