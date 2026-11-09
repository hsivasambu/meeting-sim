# This Could've Been an Email

Six adults are trying to agree on a cuisine for lunch. Start, nominate a cuisine,
and choose how to move the room toward agreement before the booking expires.
Results show the actual agreement and its discussion cost. Play again to start
a fresh meeting. The title screen shows lunch awards and, if present, the
separate archived launch collection.

L08 activates the [D18-approved lunch table](docs/content-table.md) and the
[approved lunch redesign](docs/lunch-redesign-plan.md). L09 is the separate lunch
playtest.

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
