# Parser Validation Matrix

## Purpose

Use this matrix to validate the smaller source set recommended for the early fork.

## Recommended Early Source Set

- LinkedIn
- Indeed
- Glassdoor
- Dice
- Built In
- USA Jobs

Optional:

- Remote OK
- We Work Remotely
- Remotive

## Validation Columns

For each source, validate:

- link creation works
- list-page parse works
- description parse works
- jobs render correctly
- parser failures are diagnosable
- source still feels worth maintenance

## Matrix

| Source | Link Create | List Parse | Description Parse | UI Render | Failure Debuggable | Keep? | Notes |
|---|---|---|---|---|---|---|---|
| LinkedIn | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | |
| Indeed | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | |
| Glassdoor | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | |
| Dice | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | |
| Built In | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | |
| USA Jobs | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | |
| Remote OK | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | optional |
| We Work Remotely | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | optional |
| Remotive | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | optional |

## Exit Rule

A source should stay in early active scope only if:

- link creation is stable
- list parsing is stable
- description parsing is usable
- failures are easy to debug
- maintenance cost feels justified

## Practical Recommendation

Do not keep a source in active scope just because parser code exists for it.

Keep only the sources that pass this validation cleanly and support the product story.
