# This Could've Been an Email

Tasks 01–03 are complete. Task 03 adds engine types, conditions, deterministic RNG and the core coverage gate; see docs/task-03-contracts.md. The reported iOS LinkedIn probe passed. Android evidence is deferred with Harry's approval; the risk is recorded in ADR 0002. The React shell displays the Friday launch objective;
the playable meeting loop is implemented in later tasks.

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
`pnpm check` runs typecheck, lint/format and Vitest with coverage. `pnpm e2e` runs against the built preview. Simulation scripts
remain reserved for their scheduled tasks and are not part of the active check.
