# Team Rodriguez — start here

**The working context for this repo is [`AGENTS.md`](AGENTS.md). Read it before making
changes.** It holds the decisions, the conventions, the open questions and the traps —
everything this file would otherwise duplicate.

Then see [`docs/ROADMAP.md`](docs/ROADMAP.md) for what is done and what is next.

---

### Why this file is a pointer and not the content

It would be a symlink, except that a fresh clone on Windows checks symlinks out as
plain text files unless `core.symlinks` is enabled — which needs Developer Mode or
admin rights. The result is a nine-byte `CLAUDE.md` containing the literal string
`AGENTS.md`, and any agent reading it gets nothing.

So: two real files, one of them a pointer. Do not "fix" this into a symlink, and do not
copy `AGENTS.md` here. One source of truth, and it is `AGENTS.md`.
