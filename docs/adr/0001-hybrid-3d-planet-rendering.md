# 1. Hybrid 3D Planet Background + 2.5D HUD Rendering Architecture

Date: 2026-08-20

## Status
Accepted

## Context
The root hub (`Louis-369.github.io`) requires an immersive "planet and continental sector" aesthetic to represent different project domains. The solution must achieve high visual impact on desktop while maintaining 60fps performance and responsive usability across mobile devices without heavy asset load times.

## Decision
We choose a **Hybrid Architecture**:
1. **Desktop**: A lightweight Three.js procedural 3D planet with orbiting particle rings, topography glow, and camera fly-in transitions.
2. **Mobile**: Adaptive fallback / low-power mode with viewport-aware parallax and touch-friendly sector carousel/cards.
3. **UI Layer**: 2.5D glassmorphic HUD overlay for crisp typography, accessibility, and direct interaction.

## Consequences
- Fast initial bundle size (<500KB total, no heavy 3D GLTF asset downloads).
- Native responsive layout ensuring smooth mobile interactions.
- Clear separation between 3D scene canvas and DOM UI controls.
