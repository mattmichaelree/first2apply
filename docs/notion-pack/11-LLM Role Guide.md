# LLM Role Guide

## Purpose

Define clear roles for each tool so the team gets leverage without duplication, chaos, or wasted tokens.

## Operating Principle

Each tool should have one primary lane.

## You

Role:

- Product owner
- Final decision maker
- Vision and prioritization
- Trust/business judgment
- User truth and validation

## Codex

Role:

- Implementation engine

Use for:

- code changes
- migrations
- schemas
- configs/env
- APIs
- UI implementation
- debugging
- test creation
- end-to-end repo execution

## Claude

Role:

- Product and architecture strategist

Use for:

- PRDs
- roadmap thinking
- ranking/filtering design
- architecture tradeoffs
- product logic
- system design questions

## ChatGPT

Role:

- Synthesis and communication partner

Use for:

- founder memos
- onboarding copy
- landing page copy
- simplification
- product explanations
- FAQ/help copy

## Perplexity

Role:

- Research engine

Use for:

- competitor pricing
- current market facts
- sourcing
- benchmarks

## Escalation Ladder

- Need facts: Perplexity
- Need meaning/tradeoffs: Claude
- Need clean articulation: ChatGPT
- Need code: Codex
- Need decision: You

## Simple Working Formula

- Perplexity finds what is true
- Claude figures out what it means
- ChatGPT makes it clear
- Codex makes it real
- You decide what matters
