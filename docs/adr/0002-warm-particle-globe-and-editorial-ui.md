# 2. Warm Ivory Point-Cloud Globe & Editorial Minimalist UI System

Date: 2026-08-20

## Status
Accepted

## Context
The website needs a distinctive, non-cliché visual identity. Instead of generic dark sci-fi glassmorphism, the user specified a warm off-white (米白/暖色系) canvas with a 3D point-cloud sphere (粒子點陣球體) where continents are defined by dot density and color nuances. Furthermore, the 3D globe must choreograph dynamic position shifts (e.g. glide to top-left or bottom-right) depending on which sector card is currently active.

## Decision
1. **Background & Color**: Warm off-white/cream canvas (`#FBF9F5` / `#F7F5EE`) with charcoal ink typography (`#1F2328`, `#383D42`) and elegant minimalist layout (Minimalist-UI / Impeccable principles).
2. **3D Visual Form**: Three.js Point-Cloud Sphere (Thousands of particles calculated via spherical Fibonacci or geographical continent lat/lon density).
3. **Dynamic Staging / Camera Choreography**: Smooth Lerp/Tween transitions of the sphere position/scale based on active sector navigation.
4. **Card & HUD Style**: Crisp editorial paper cards with fine borders (`1px solid rgba(0,0,0,0.08)`), micro-interactions, clean negative space, avoiding heavy dark glassmorphism.

## Consequences
- Highly distinctive, artistic, and sophisticated aesthetic (merging generative art with editorial design).
- Extremely performant rendering (particle rendering in Three.js buffer geometry is lightweight and mobile-friendly).
