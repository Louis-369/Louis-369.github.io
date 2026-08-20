# 14. High-Density Micro-Dot Particle Scaling & Contrast Accessibility

Date: 2026-08-20

## Status
Accepted

## Context
The previous point-cloud sphere had particles that were too large and clustered into overlapping blobs, reducing visual refinement and potentially interfering with text contrast. Applying `impeccable` and `minimalist-ui` guidelines, the interface requires crisp non-overlapping particle rendering and strict foreground text contrast guarantees (WCAG AA/AAA).

## Decision
1. **Particle Micro-Scale & Non-Overlapping Spacing**:
   - Increased particle count to 6,400 with Fibonacci distribution for uniform, mathematically separated point distribution.
   - Reduced dot size by ~60%: Continent micro-dots scaled to ~1.2–2.0px equivalent, Ocean dots to ~0.6–0.9px stardust.
   - Material base size reduced from 1.0 to 0.55 with `sizeAttenuation: true`.
   - Slightly compacted sphere radius to 2.85 with camera distance at 10.2 to establish generous editorial breathing room.
2. **Text Legibility & Layer Contrast Protection**:
   - Solid paper card backgrounds (`#FFFFFF`) with refined 1px tactile borders ensure zero particle bleed-through behind card text.
   - Text color tokens mapped to high-contrast charcoal ink (`--ink-primary: #111827` [15:1 contrast against ivory], `--ink-secondary: #374151`, `--ink-muted: #6B7280`).
   - Floating navigation pills and coordinate badges use frosted glass (`rgba(255, 255, 255, 0.92)` with `backdrop-filter: blur(12px)`) ensuring text is never compromised by moving particles behind it.

## Consequences
- Exceptional craft and delicacy — particles look like an authentic celestial point-cloud drawing.
- Zero text legibility issues across all device sizes and color drifts.
