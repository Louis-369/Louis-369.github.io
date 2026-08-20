# 9. Typography System: Editorial Magazine Font Stack

Date: 2026-08-20

## Status
Accepted

## Context
The previous dark-themed index.html used Plus Jakarta Sans + JetBrains Mono + Noto Sans TC. The new warm ivory editorial aesthetic requires a more refined magazine-quality type system.

## Decision
Replace the existing font stack with:
- **`DM Serif Display`** — Large display headlines, sector titles, hero signature line. Elegant serif with editorial gravitas.
- **`Inter`** — Body text, card descriptions, navigation labels. Neutral, highly legible, warm-neutral at small sizes.
- **`Geist Mono`** — Coordinate labels, sector data tags (e.g. `LAT 23.5°N`), tech tags. Crisp, modern mono with personality.
- **`Noto Sans TC`** — Chinese text fallback for card descriptions and any traditional Chinese UI copy.

All fonts loaded via Google Fonts single request, display=swap for zero FOUT blocking.

## Consequences
- Font combination perfectly matches the warm ivory paper-editorial identity.
- One additional Google Fonts HTTP request (acceptable trade-off for aesthetic payoff).
- Old font references (Plus Jakarta Sans) to be fully removed from CSS.
