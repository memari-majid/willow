# Willow documentation

Everything in this folder is for **humans**. Pick the section that
matches your role — you don't have to read the others.

> **The single source of truth for "what's done, what's next" is
> [`ROADMAP.md`](../ROADMAP.md) at the repo root.** Read it first
> regardless of role.

---

## I'm a Subject Matter Expert (SME)

You author the clinical method, the persona, the safety wording, and
the techniques. You don't need to read code.

Start with **[`sme/GUIDE.md`](./sme/GUIDE.md)** — your complete
two-week onboarding plus the weekly cycle once Willow is live.

| You want to... | Read |
|---|---|
| Understand the whole job | [`sme/GUIDE.md`](./sme/GUIDE.md) |
| Add a new wellbeing exercise | [`sme/add-a-technique.md`](./sme/add-a-technique.md) |
| Edit Willow's content | jump straight into [`../content/`](../content/) — every file is plain Markdown |
| See what's still placeholder | open `/sme` in the running app |

You can ignore everything under `developer/`.

---

## I'm a Developer

You own the plumbing — Next.js routes, AI Gateway wiring, the
loader, the dashboard. You do **not** author clinical content.

Start with **[`developer/GUIDE.md`](./developer/GUIDE.md)** — Day 1
onboarding, the cheat sheet, the deploy + rollback playbook, and
everything in between.

| You want to... | Read |
|---|---|
| First-time setup | [`developer/getting-started.md`](./developer/getting-started.md) |
| Mental model of the codebase | [`developer/architecture.md`](./developer/architecture.md) |
| Configure / understand the AI Gateway | [`developer/ai-gateway.md`](./developer/ai-gateway.md) |
| Give the AI a tool (function call) | [`developer/add-a-tool.md`](./developer/add-a-tool.md) |
| Deploy or roll back | [`developer/deploy-to-vercel.md`](./developer/deploy-to-vercel.md) |
| Add auth, persistence, observability… | [`developer/extending.md`](./developer/extending.md) |
| Set up the research / R&D loop | [`developer/research-mode.md`](./developer/research-mode.md) |

The `sme/` docs are the SME's territory but worth skimming so you
know what they're working from.

---

## I'm both — or I'm working with the other role today

Read the **[`shared/`](./shared/)** docs. They cover the parts where
the two roles touch:

| Doc | What's in it |
|---|---|
| [`shared/content-folder.md`](./shared/content-folder.md) | How a Markdown edit becomes part of the AI's instructions — pipeline diagram, lifecycle, common pitfalls. |
| [`shared/collaboration.md`](./shared/collaboration.md) | The operating manual for the SME ↔ developer pair: cadence, going-live checklist, escalation paths. |

---

## File map at a glance

```
docs/
├── README.md           ← you are here
├── sme/                ← Subject Matter Expert
│   ├── GUIDE.md
│   └── add-a-technique.md
├── developer/          ← Developer
│   ├── GUIDE.md
│   ├── getting-started.md
│   ├── architecture.md
│   ├── ai-gateway.md
│   ├── add-a-tool.md
│   ├── deploy-to-vercel.md
│   ├── extending.md
│   └── research-mode.md
└── shared/             ← read by both
    ├── content-folder.md
    └── collaboration.md
```

For everything *outside* `docs/` — the source code, the SME's
content folder, the agent rules — see the
[repo README](../README.md).
