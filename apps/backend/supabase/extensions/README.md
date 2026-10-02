# Extensions

This folder contains additive SQL for the new intelligence layer.

These files are intentionally separate from the inherited `seed.sql` so the baseline discovery schema can stay stable while the new product layer evolves.

Current files:

- `001_intelligence_layer.sql`

Suggested usage:

1. Apply `seed.sql` to establish the inherited baseline
2. Validate the inherited discovery flow
3. Apply extension SQL files when you are ready to add the new moat layer

Guiding principle:

- keep inherited discovery stable
- add enrichment/scoring/filtering tables separately first
