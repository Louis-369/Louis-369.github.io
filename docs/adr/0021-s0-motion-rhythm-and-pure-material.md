# 21. S0-Style Kinetic Viewport Reveal Rhythm & Pure Minimalist Material

Date: 2026-08-23

## Status
Accepted (Refines ADR 0018-0020)

## Context
The user requested exact mechanical pacing and motion rhythm matching `s0animation.com`'s expanding viewport reveal (central box focus -> explosive clip-path expand with counter-scale zoom -> staggered typography release). Gold foil elements are removed in favor of pure, ultra-clean editorial monochrome paper craft.

## Decision
1. **Precise Motion Rhythm (1:1 with s0animation)**:
   - **Phase 1 (Focus / Preload, 0.0s - 0.7s)**: Central floating frame with `clip-path: inset(24% 28% 24% 28% round 20px)`, interior media at `scale: 1.35`, showing minimal monogram/loader.
   - **Phase 2 (Expanding Reveal, 0.7s - 1.9s)**: GSAP Timeline with `power4.inOut` expanding frame to `inset(0% 0% 0% 0% round 0px)` while interior media zooms out smoothly to `scale: 1.0`.
   - **Phase 3 (Typography & Interface Release, 1.4s - 2.2s)**: Staggered line reveal for display typography (`Louis`, tagline, metadata chips) and navigation header.
   - **Phase 4 (Smooth Scroll Active, 2.0s+)**: Lenis smooth scroll engine takes over, transitioning naturally into Monolog-style stacking paper-cut project cards.
2. **Material System**:
   - Pure warm ivory paper background (`#F9F8F5`), charcoal ink (`#111827`), subtle paper grain texture (`opacity: 0.04`), completely omitting gold foil for an unadorned, high-craft editorial aesthetic.

## Consequences
- Authentic Awwwards SOTD-grade motion rhythm.
- Pure typography and layout clarity with zero extraneous ornament.
