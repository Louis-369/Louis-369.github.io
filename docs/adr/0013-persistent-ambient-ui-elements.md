# 13. Persistent Ambient UI Elements

Date: 2026-08-20

## Status
Accepted

## Context
Regardless of which sector or state the visitor is in, certain minimal UI elements must always remain visible to provide orientation, navigation, and ambient identity.

## Decision
Three fixed ambient elements, always present at every state:

1. **Top-left — Identity Anchor**: The initial `L` monogram or wordmark `Louis` in `DM Serif Display`. Clicking always returns the visitor to Landing State (triggering reverse choreography via GSAP).
2. **Top-right — GitHub Icon**: A minimal GitHub SVG icon link (`github.com/Louis-369`). Subtle opacity (0.5) at rest, full opacity on hover. Never competes with content.
3. **Bottom-left — Live Coordinate Readout**: A `Geist Mono` micro-label displaying the globe's current rotational coordinates in real time (e.g., `LAT 23.5°N · LON 121.0°E`). Updates on every animation frame. On sector selection, smoothly tweens to the sector's anchor coordinates. Reinforces the "planetary explorer" spatial metaphor throughout the entire experience.

## Consequences
- The coordinate readout is a signature detail that makes the site feel crafted and alive at all times.
- The `L` monogram provides an always-accessible escape hatch back to Landing State without needing a traditional navigation bar.
- All three elements are positioned with `position: fixed` and high `z-index`, never obscured by the globe canvas or card panels.
