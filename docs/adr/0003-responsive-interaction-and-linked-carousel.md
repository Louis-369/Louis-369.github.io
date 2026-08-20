# 3. Responsive Interaction & Linked Carousel Model

Date: 2026-08-20

## Status
Accepted

## Context
The interaction must deliver an intuitive, frictionless experience on both desktop screens (large horizontal real estate) and mobile devices (compact vertical touchscreen).

## Decision
1. **Desktop Interaction**:
   - Navigation via top/side sector tabs or direct keyboard/cursor interaction.
   - When a sector is activated, the 3D point-cloud globe smoothly tweens its coordinates (offsetting to balance layout, e.g., top-left, bottom-right) and rotates to face the sector's coordinates.
   - Foreground project cards transition using staggered editorial entrances.
2. **Mobile Interaction**:
   - Two-tier viewport layout: Top ~40-45vh dedicated to the interactive particle globe; bottom area hosts a horizontal swipeable card carousel.
   - Swiping cards actively drives the rotational target of the 3D globe in real time (bi-directional sync).
   - High-performance touch gesture handling with CSS scroll snap / touch delta lerping.

## Consequences
- Single unified codebase with fluid CSS / JS responsive adaptations.
- Zero clutter on mobile with clear thumb-friendly ergonomics.
