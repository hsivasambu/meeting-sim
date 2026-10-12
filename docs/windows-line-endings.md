# Windows checkout line-ending hygiene — October 12, 2026

Prepared separately from task 07b, as finding 7 of its Claude review requested.
The only repository configuration change is `.gitattributes` with
`* text=auto eol=lf`; binary files keep automatic detection. No CI, formatter,
dependency, gameplay, fixture or golden content changes.

Committed policy `57851d8` was cloned locally into a fresh Windows checkout with
`git -c core.autocrlf=true clone --no-hardlinks`. `core.autocrlf=true` was also
saved in the clone. `git ls-files --eol` found no CRLF/mixed working-tree files,
and the installed Prettier CLI passed `--check .` there without normalization.
The existing worktree predates the policy, so its CRLF files were normalized once
with Prettier before its ordinary checks; those files have no content diff.

Local Node 24.21.0 / pnpm 10.34.6: `pnpm check` passes 277 tests in 25 files;
`pnpm build`, `pnpm size` (70,410/122,880 gzip JS bytes; 0/409,600 asset bytes)
and `pnpm e2e` (18 passes) pass. This branch is based on main/task 07a and does
not include task 07b content. Hosted evidence is pending its separate chore PR;
this note does not advance the blueprint task status.
