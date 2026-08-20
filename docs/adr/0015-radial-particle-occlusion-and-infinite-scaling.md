# 15. Radial Particle Occlusion Mask & Infinite Sector Scaling Architecture

Date: 2026-08-20

## Status
Accepted

## Context
When displaying the landing state hero text or dense project cards, 3D particles in the center of the viewport can cause visual vibration and reduce typography legibility. In addition, the system requires dynamic extensible staging math to support any number of sectors (5, 6, 7+), as well as multi-card grid layouts and "Under Construction / WIP" project states.

## Decision
1. **GPU Radial Particle Occlusion Mask (`globe.js`)**:
   - The custom point-cloud fragment shader calculates normalized device coordinates (`ndc`).
   - Particles passing through the central text viewport zone smoothly fade out (`alpha = 0`) via `smoothstep`, creating a 100% clean paper-canvas reading zone while preserving the outer celestial particle sphere.
   - When entering sector views, the mask smoothly transitions or shifts with the globe.
2. **Infinite Dynamic Sector Staging**:
   - If a sector does not specify manual pixel offsets, `choreographer.js` and `globe.js` dynamically compute the optimal stage position based on sector index `i % 4` and viewport dimensions.
3. **Multi-Card Sector Grid & WIP States (`projects.js` & `style.css`)**:
   - Multi-card sector layout automatically scales using CSS Grid (`repeat(auto-fit, minmax(320px, 1fr))`).
   - Support for `status: "WIP / 施工中"` badges with amber pulsing indicators and construction placeholders.
