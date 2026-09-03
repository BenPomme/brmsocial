# Domain docs

Single-context repo. One glossary, one ADR folder.

## Before exploring, read these

- `CONTEXT.md` at the repo root (glossary). If it is missing, proceed; `/domain-modeling` creates it when a term is resolved.
- `00-LIRE.md` (index, two repos, what not to do)
- `01-produit.md` (what is sold now vs coming soon)
- `14-agents.md` (no new agent ids without a line there)
- `12-decisions-ouvertes.md` (figées)
- `docs/adr/` when present: read ADRs that touch the area you are about to work in

If `CONTEXT.md` or `docs/adr/` do not exist yet, do not flag their absence.

## File structure

```
/
├── CONTEXT.md
├── 00-LIRE.md
├── docs/adr/
├── docs/agents/        ← this folder
└── src/
```

## Use the glossary's vocabulary

When output names a domain concept (issue title, refactor, hypothesis, test name), use the term as defined in `CONTEXT.md`. Do not drift to synonyms the glossary explicitly avoids.

If the concept is not in the glossary yet, either you are inventing language the project does not use, or there is a real gap for `/domain-modeling`.

## Flag ADR conflicts

If output contradicts an existing ADR, surface it rather than silently overriding.
