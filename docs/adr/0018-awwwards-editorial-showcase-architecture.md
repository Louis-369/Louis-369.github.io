# 18. Architectural Pivot: Awwwards-Grade Editorial Showcase (Vanilla ESM + Lenis + GSAP ScrollTrigger + Paper-Cut Parallax)

Date: 2026-08-23

## Status
Accepted (Supersedes ADR 0001-0017 planet-centric model)

## Context
The previous point-cloud sphere experiment revealed fundamental readability and spatial composition conflicts between centered typography and full-screen 3D globes. The user selected reference benchmarks: `bymonolog.com` (paper-cut framing, stacking card parallax, success stories layout) and `s0animation.com` (bold editorial typography, magnetic kinetic cursor, smooth page pacing).

## Decision
1. **Core Tech Stack**: **No-Framework / Vanilla ESM**
   - **Lenis**: Buttery smooth inertial scrolling.
   - **GSAP & ScrollTrigger**: Stacking cards pinning, paper-cut perspective tilt, line-reveal typography animations.
   - **Three.js / WebGL (Ambient)**: Lightweight subtle background fluid/grain or interactive hero accent (non-obstructive).
2. **Visual & Interaction Blueprint**:
   - **Hero Section**: High-impact editorial headline (`DM Serif Display` / `Anton` + `Inter` + `Geist Mono`), dynamic time/location badge, live availability indicator.
   - **Selected Works / Success Stories**: Monolog-style paper-cut frames with floating image windows, deep perspective mouse tilt on desktop, and vertical card stacking on mobile.
   - **Projects**: `Mind-Sync`, `Sticker to GIF`, `FitStepSync`, and upcoming innovations.
   - **About / Philosophy Section**: Editorial statement with split-text highlight reveal on scroll.
   - **Contact / Footer**: Magnetic interactive links to GitHub and email.

## Consequences
- 100% WCAG AAA typography legibility on crisp ivory/monochrome paper backdrop.
- Flawless 60fps performance across desktop and mobile devices without heavy framework overhead.
- True Awwwards/FWA-grade editorial craft and tactile physical depth.
