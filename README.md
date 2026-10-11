# This Could've Been an Email

Task 01 foundation only. The React shell displays the Friday launch objective;
the playable meeting loop is implemented in later tasks.

Read [CLAUDE.md](CLAUDE.md) and [the implementation plan](docs/implementation-plan.md)
before making changes. Task 02 is next.

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
`pnpm check` currently runs types and lint/format. Test, simulation and E2E scripts
are reserved for their scheduled tasks and are not part of the active check.
