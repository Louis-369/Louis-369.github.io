# 16. Vertical Orbital Staging & 85% Expanded Card Canvas

Date: 2026-08-20

## Status
Accepted

## Context
Centering text directly over the 3D globe caused visual interference or required unnatural hollow cutout masks. The layout needs a spatial separation between the typography layer and the 3D planet, while expanding the sector cards layer to 80–85% for generous multi-card browsing.

## Decision
1. **Vertical Orbital Staging (垂直軌道分層構圖)**:
   - **Upper Viewport (~30-35%)**: Dedicated to crystal-clear editorial typography (`Louis`, tagline, protocol badge) on pure warm ivory canvas with zero particle overlap.
   - **Lower Viewport (~65-70%)**: Houses the full, unbroken, solid 3D point-cloud sphere (removed artificial hollow shader mask).
2. **80%–85% Expanded Sector Overlay**:
   - Sector detail container (`.sector-inner`) expanded to `max-width: 1080px` (occupying ~80–85% of viewport width), providing ample room for multi-card grid layouts and staggered entrances.
3. **Responsive Flow**:
   - Naturally harmonizes with mobile viewports without requiring drastic layout re-architecting.
