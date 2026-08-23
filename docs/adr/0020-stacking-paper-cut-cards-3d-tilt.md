# 20. Stacking Paper-Cut Cards with 3D Perspective Tilt for Featured Projects

Date: 2026-08-23

## Status
Accepted

## Context
The primary project showcase requires a tactile, multi-layered editorial interaction inspired by `bymonolog.com`'s Success Stories section.

## Decision
1. **Stacking Cards Mechanics (GSAP ScrollTrigger)**:
   - As the user scrolls into the `#works` section, each project card is pinned and incrementally stacked on top of the preceding card with a slight scale (`scale: 0.96 -> 1.0`) and vertical parallax offset.
2. **Paper-Cut Window & Dynamic Media Portals**:
   - Each card features a crisp paper-cut window with 1px tactile borders and a subtle champagne gold sheen.
   - The interior portal showcases the project's interactive visual preview with an inner parallax zoom effect (`translateY(15%) -> translateY(-15%)`) on scroll.
3. **Magnetic 3D Perspective Tilt (Desktop)**:
   - Mouse movement over any card calculates normalized X/Y deltas and applies a smooth `transform: perspective(1000px) rotateX(...) rotateY(...)` with Lerp damping.
4. **Mobile Responsive Grace (Touch)**:
   - On mobile screens, cards gracefully unpin into a smooth vertical cascading stack with intersection-observer entrance fades, ensuring 60fps zero-friction touch scrolling.

## Consequences
- Deep tactile satisfaction and memorable interaction that earns Awwwards-grade praise.
- Clean separation between card UI data and animation drivers.
