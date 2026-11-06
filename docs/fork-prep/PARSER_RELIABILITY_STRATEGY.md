# Parser Reliability Strategy

## Purpose

This document describes how to evolve the inherited parser setup into something maintainable for a forked product.

## Current State

The repo already has at least a minimal parser test file with fixtures for:

- LinkedIn list parsing
- Dice list parsing

This is a strong starting point, but not enough for long-term reliability across many sources.

## Main Risk

Parser drift is one of the biggest inherited risks in this codebase.

If source markup changes and fixtures/tests are thin, breakage becomes reactive and expensive.

## Strategy

## 1. Pick a smaller active source set

Only actively maintain the sources that matter most to the fork.

## 2. Add fixtures for every actively supported source

For each active source, maintain:

- list-page fixture
- description-page fixture
- expected key fields

## 3. Add parser-level regression tests

Tests should verify:

- list found
- element count is reasonable
- expected jobs are parsed
- key fields are extracted
- description parser returns non-empty content where expected

## 4. Capture failures intentionally

When parsing fails in production-like testing:

- keep HTML dumps
- annotate source, date, parser version
- convert representative failures into fixtures if useful

## 5. Treat parser support as a maintained contract

For every source in active scope, decide:

- owned and tested
- experimental
- deprecated

## Early Recommendation

For the fork, aim for:

- parser fixtures for the small retained source set
- one list fixture plus one description fixture per active source
- a short checklist for validating each parser after major changes

## Practical Rule

Do not add more active sources faster than you can add fixtures for them.
