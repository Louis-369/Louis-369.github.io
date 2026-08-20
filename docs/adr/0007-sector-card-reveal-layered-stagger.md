# 7. Sector Card Reveal: Layered Stagger over Persistent Globe

Date: 2026-08-20

## Status
Accepted

## Context
When a sector is selected, the foreground content area must reveal project cards in an editorial, layered fashion while maintaining the globe's visible presence to reinforce spatial continuity.

## Decision
**Layered Depth Composition**:
1. **Z-layer 0 (底層)**: The Three.js canvas globe remains persistent and visible, continuing its slow auto-rotation. It occupies 100% of the viewport as a background layer.
2. **Z-layer 1 (前景)**: On sector activation, a card panel area slides/fades in and occupies approximately 70% of the viewport (positioned top-center or right-dominant depending on globe drift direction). Cards stagger-reveal using GSAP timeline with 0.08s offsets.
3. **Sector title** fades in first, then cards cascade in from bottom at staggered intervals.
4. A minimal back-navigation (e.g., `← Back` or an orbit icon) returns to the Landing State, triggering reverse choreography.

## Consequences
- Globe never fully disappears — spatial metaphor stays intact throughout the entire experience.
- GSAP stagger + GSAP timeline handles sequencing cleanly.
- 70/30 split (cards/globe-visible-area) maintains visual breathing room.
