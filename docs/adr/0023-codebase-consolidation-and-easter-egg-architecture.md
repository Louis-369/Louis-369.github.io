# 23. Codebase Architecture Consolidation, Comment Hygiene, and Interactive Engines

Date: 2026-08-29

## Status
Accepted

## Context
As the portfolio evolved through rapid iterations—introducing the Suminagashi WebGL opening fluid simulation, timed story progression slider with split-text stagger, psychic silver spoon Bézier physics, and the Matrix digital rain Easter egg—the codebase accumulated historical comments, outdated naming (`globe.js`), and legacy data attributes.

## Decisions

1. **Module Renaming & Semantic Clarity**:
   - Renamed `globe.js` to `fluid-engine.js` to accurately reflect its role as the WebGL Navier-Stokes Ping-Pong FBO fluid simulator.

2. **Comment Hygiene & JSDoc Standards**:
   - Replaced all colloquial, experimental, and iterative comments across `app.js`, `choreographer.js`, `matrix.js`, and `fluid-engine.js` with structured, professional JSDoc annotations and pure mathematical/architectural explanations.

3. **Dead Code & Safeguard Elimination**:
   - Removed obsolete verification flags (`DEBUG_DOT`), dead DOM checks (`#zen-leaf-curtain`), and unused legacy data attributes (`colorScheme`, `coverBadge`).

4. **Performance & 60fps Optimization**:
   - Eliminated layout thrashing in spoon hover interactions by caching bounding boxes on `mouseenter`.
   - Optimized capability stack item hover delegation by caching target nodes.
   - Guaranteed 100% GPU memory release in `fluid-engine.js` via explicit `deleteFramebuffer`, `deleteTexture`, `deleteProgram`, and `WEBGL_lose_context`.
   - Resolved canvas DPR scaling and off-screen gap in `matrix.js` to maintain a dense, continuous digital waterfall.

5. **Documentation Synchronization**:
   - Updated `CONTEXT.md` to establish ubiquitous language matching the active production code.
