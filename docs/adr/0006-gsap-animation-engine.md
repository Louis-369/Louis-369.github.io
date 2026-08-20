# 6. Animation Engine: GSAP for All Choreography

Date: 2026-08-20

## Status
Accepted

## Context
The design requires multiple coordinated, high-fidelity animations: globe kinetic position shifts, staggered card reveals, page palette transitions, landing entry sequence, and mobile swipe sync. These need precise timing, easing control, and reliable cross-browser performance.

## Decision
Use **GSAP (GreenSock Animation Platform)** as the primary animation engine for all choreography:
- `gsap.to()` / `gsap.fromTo()` for globe position/scale tweens and card stagger reveals.
- `gsap.timeline()` for sequencing landing entry (globe fade-in → text appear → nav anchors).
- GSAP's `lerp`-compatible delta for mobile touch swipe globe sync.
- CSS custom property tweening for full-page palette color transitions.

## Consequences
- Buttery-smooth, precisely-timed animations with minimal code.
- GSAP is CDN-loadable, perfectly compatible with the Vanilla ESM tech stack.
- No conflict with Three.js render loop (GSAP drives DOM/CSS; Three.js drives canvas).
