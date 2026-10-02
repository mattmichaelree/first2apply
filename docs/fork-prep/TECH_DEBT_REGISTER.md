# Technical Debt Register

## Purpose

This register captures the most obvious inherited technical risks so they stay visible while the fork moves forward.

## 1. Parser Fragility

### Risk

Many job sources depend on DOM selectors and layout-specific assumptions.

### Why It Matters

Markup drift can break acquisition quality without obvious product-level changes.

### Recommended Treatment

- keep source set small early
- add parser fixtures/tests
- track parser breakages explicitly

## 2. Overloaded `jobs` Table Pressure

### Risk

There will be temptation to push scoring, filtering, and shared-corpus concerns directly into `jobs`.

### Why It Matters

This can make future architecture harder to separate and evolve.

### Recommended Treatment

- use additive tables first
- evolve core schema only after concepts stabilize

## 3. Provider Entanglement

### Risk

The inherited repo mixes discovery logic with multiple providers:

- Supabase
- AI provider
- Stripe
- analytics
- logging
- email systems

### Why It Matters

It can make the fork feel more coupled than it needs to be.

### Recommended Treatment

- identify which providers are baseline-critical
- stub or defer the rest

## 4. Product Surface Noise

### Risk

There are multiple surfaces that are not core to the fork baseline:

- blog
- landing page
- web companion
- invoice tooling
- utility backends

### Why It Matters

They can steal focus from the actual moat.

### Recommended Treatment

- explicitly defer non-core surfaces
- focus on desktop + backend + shared libs first

## 5. Advanced Matching as a False Architecture Anchor

### Risk

The inherited AI filtering can look like a starting point for the final intelligence layer, but it is too narrow to serve as the long-term architecture.

### Why It Matters

It can pull future design toward short-term hacks instead of a cleaner ranking/filtering model.

### Recommended Treatment

- keep it as a transitional feature
- do not let it define the long-term scoring/filtering system

## 6. Release / Distribution Assumptions

### Risk

The repo contains inherited release workflows and artifact naming tied to the original product identity and hosting.

### Why It Matters

These can create hidden breakage later if not treated deliberately.

### Recommended Treatment

- audit and defer release hosting details until baseline is validated
- do not assume inherited workflows can be used unchanged
