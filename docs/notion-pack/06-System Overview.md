# System Overview

## Purpose

This page explains the current system at a high level and shows how inherited infrastructure connects to the new product layers we will build.

## Current Architecture

The current system is a desktop-first discovery pipeline:

1. User saves a job-search URL
2. Desktop app opens that page locally in a hidden browser context
3. HTML is captured and sent to the backend
4. Backend parses job cards and stores jobs
5. Desktop app opens job detail pages
6. Backend parses descriptions and metadata
7. Jobs are displayed in the UI

## Inherited Core

The inherited core currently handles:

- Desktop app runtime
- Browser-based scraping
- Link scanning
- Job list parsing
- Job description parsing
- Persistence of links/jobs/site metadata
- Basic filtering/settings interactions

## Future Extension Layer

We will add a layer on top of the inherited core for:

- Enrichment
- Ranking
- Filtering
- Explanation
- Optional shared corpus ingestion
- Future workflow features

## Architecture Principle

The inherited core should remain the `collection and parsing engine`.

Our new architecture should become the `intelligence and workflow layer`.

## Near-Term System Boundary

Inherited core:

- scraping
- parsing
- persistence baseline

New layer:

- enrichment
- scoring
- filtering
- explanations
- canonicalization
- new UX behaviors

## Desired Future Shape

- Collection layer
- Parsing layer
- Enrichment layer
- Ranking/filtering layer
- Presentation/workflow layer
- Optional shared corpus layer
