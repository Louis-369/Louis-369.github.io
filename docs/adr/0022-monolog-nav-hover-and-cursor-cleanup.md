# 22. Monolog-Style Interactive Nav Buttons and Native Cursor Restoration

Date: 2026-08-23

## Status
Accepted

## Context
The full-screen custom cursor circle caused visual friction. The user requested replacing it with `bymonolog.com`'s refined micro-interactions: rolling marquee text roll, 45-degree arrow flying transitions, and elastic pill hover feedback on the header and interactive links.

## Decision
1. **Remove Custom Large Cursor Circle**:
   - Restore clean, zero-lag native browser cursor.
2. **Monolog Header Rolling Text & Arrow Transition**:
   - Buttons feature double-layer vertical text roll (`translateY(-1.2em)` with `text-shadow: 0 1.2em 0 currentColor`).
   - Arrow container features diagonal ejection (`translate(100%, -100%)` out, `translate(0, 0)` in).
   - Elastic pill hover easing: `cubic-bezier(0.48, 1.68, 0.64, 1)`.
3. **Wipe-In Underlines for Nav Links**:
   - Smooth `transform-origin: left / right` scale animation on nav items.
