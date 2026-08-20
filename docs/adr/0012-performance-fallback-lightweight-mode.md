# 12. Performance Fallback: Lightweight Mode (Reduced Particles)

Date: 2026-08-20

## Status
Accepted

## Context
The Three.js point-cloud globe must remain performant across a wide range of devices, from high-end desktop GPUs to mid-range Android phones.

## Decision
**Lightweight Mode** with automatic tier detection:
1. At initialization, measure first-frame render time or check `navigator.hardwareConcurrency`.
2. If device is classified as low-tier:
   - Particle count: reduced from ~5000 to ~1500.
   - Cursor Gravity Dimple: disabled.
   - Parallax Tilt: disabled.
   - Globe auto-rotation and Kinetic Staging (position shift on sector change): retained.
3. Threshold: if `hardwareConcurrency <= 4` OR first frame takes > 32ms, activate Lightweight Mode.
4. `prefers-reduced-motion` media query: if set, disable all continuous animation (auto-rotation stops, only sector-triggered transitions remain, shortened to 200ms).

## Consequences
- Visual coherence is maintained at all device tiers (no jarring fallback to static).
- The spatial metaphor (globe + sector navigation) remains fully functional.
- Respects user accessibility preferences (prefers-reduced-motion).
