# This Could've Been an Email

The current code is the text-only launch meeting baseline. The lunch redesign
rules and plan were approved on October 13, 2026; gameplay has not switched yet.
Harry approved the [L02b-reviewed lunch table](docs/content-table.md) and D18
on October 14, 2026. Its initial content is approved for the scheduled preparation
tasks; live activation remains L08. See the
[approved plan](docs/lunch-redesign-plan.md), [task sequence](docs/implementation-plan.md)
and [writing review brief](docs/lunch-writing-review.md). A successful lunch run
must record and display the actual agreed cuisine. Original task 12a V4 human
evidence remains pending; L09 is the separate new lunch playtest.

Read [CLAUDE.md](CLAUDE.md) and [the implementation plan](docs/implementation-plan.md)
before making changes. See [task 02 setup](docs/task-02-setup.md) for the Vercel preview and real-device probe.

Use Node 24 through fnm and the Corepack-managed pnpm version in package.json:

```powershell
fnm install
fnm exec --using 24 cmd /c corepack pnpm install --frozen-lockfile
fnm exec --using 24 cmd /c corepack pnpm check
fnm exec --using 24 cmd /c corepack pnpm build
fnm exec --using 24 cmd /c corepack pnpm size
fnm exec --using 24 cmd /c corepack pnpm dev
```

On this machine the downloaded fnm executable is `.tools/fnm/fnm.exe`.
Replace `fnm` with that path if it is not on PATH. No shell profile was changed.
`pnpm check` runs typecheck, lint/format, Vitest with coverage and the active
Greedy/Random simulation invariants. `pnpm e2e` runs against the built preview.
Seven-policy reporting and balance follow L10–L12; the technical spec owns gates.
