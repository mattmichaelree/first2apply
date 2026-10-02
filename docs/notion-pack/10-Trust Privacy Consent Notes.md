# Trust Privacy Consent Notes

## Purpose

Set guiding principles for how we handle user trust, centralized data decisions, and any future shared corpus strategy.

## Core Principle

User trust is a product feature, not just a legal requirement.

## What We Need To Be Careful About

- What job data is collected locally
- What data is stored per user
- Whether data is ever sent into a shared corpus
- Whether user-specific metadata can leak into shared systems
- How clearly users understand what is happening

## Default Position

For the earliest version:

- keep user data private by default
- avoid centralizing scraped jobs unless there is explicit product value and explicit user consent
- avoid ambiguous product language around data usage

## Consent Principle

If we ever introduce shared job ingestion:

- it should be clearly described
- it should be explicit, not hidden
- users should understand the tradeoff and benefit
- it should be revocable where possible

## Trust Rules

- Do not surprise users
- Do not rely on vague language for sensitive behavior
- Do not bury important data behavior in obscure settings
- Do not treat shared data decisions as purely technical

## MVP Recommendation

For MVP:

- keep centralized sharing out unless it is core to the launch thesis
- build the architecture seam now
- make the product trustworthy before making it more ambitious
