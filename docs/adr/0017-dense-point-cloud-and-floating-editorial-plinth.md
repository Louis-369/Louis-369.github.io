# 17. High-Density 14,000 Point-Cloud Globe & Floating Editorial Plinth (15/85 Split)

Date: 2026-08-20

## Status
Accepted

## Context
The landing state requires full centered celestial sphere presence with high particle density, while resolving text legibility without artificial cutout holes. Furthermore, the transition to sector views must follow a 15% (globe ambient compass) to 85% (project cards) ratio.

## Decision
1. **Ultra-Dense Micro-Particles (14,000 Points)**:
   - Increased particle count to 14,000 (4,800 on low-power devices) with micro-diameter scaling (~0.024–0.042 units).
   - Crisp, vector-antialiased shader rendering providing smooth celestial texture without overlapping fish scales.
2. **Floating Editorial Plinth (首頁紙感懸浮面板)**:
   - Centered hero typography is enclosed within an ultra-refined editorial plinth (`background: rgba(255, 255, 255, 0.90); backdrop-filter: blur(20px); border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 12px 32px rgba(0,0,0,0.04)`).
   - Guarantees 100% crystal-clear readability for `Louis` and tagline while the complete, unbroken sphere rotates directly behind it.
3. **15% Globe / 85% Content Sector View Transition**:
   - On sector activation, the 3D globe scales down to ~0.55 (occupying ~15% visual footprint) and glides to the side/corner.
   - The project cards container expands to 85% of the screen area, dominating the viewport.
