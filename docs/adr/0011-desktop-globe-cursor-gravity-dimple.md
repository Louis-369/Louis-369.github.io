# 11. Desktop Globe Interaction: Passive Ambient + Cursor Gravity Dimple

Date: 2026-08-20

## Status
Accepted

## Context
The desktop globe must feel alive and responsive to the user's presence without allowing free drag-rotation (which would distract from project navigation).

## Decision
**Passive Ambient Globe** with **Cursor Gravity Dimple** effect:
1. The globe does NOT accept drag/rotate input from the user.
2. **Parallax Tilt**: Globe subtly tilts 3–5° in response to cursor position across the viewport (soft magnetic pull on the whole sphere).
3. **Cursor Gravity Dimple (游標引力凹陷)**: When the cursor is near or over the globe canvas, each particle calculates its proximity to the projected cursor position on the sphere surface. Particles within the influence radius are displaced radially *inward* (toward the sphere center) proportionally to their closeness — creating a smooth organic concave dent. On cursor exit, particles spring back to their original positions with a gentle elastic ease.
4. Implemented via per-frame BufferGeometry position update in Three.js render loop.

## Consequences
- Reinforces the "this is a living, touchable object" feeling without ambiguity about navigation.
- Technically: requires per-frame particle proximity calculation (O(n) per frame, ~3000-5000 particles, trivially fast).
- Adds significant "wow factor" and tactile sensation at near-zero complexity cost.
