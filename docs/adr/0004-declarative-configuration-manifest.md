# 4. Declarative Configuration-Driven Project Manifest

Date: 2026-08-20

## Status
Accepted

## Context
The site must allow frictionless addition of new projects and re-naming of continental sectors without requiring modifications to 3D rendering loops, camera choreography, or DOM layout logic.

## Decision
All sector metadata (names, globe coordinates, palette accents) and project node items (titles, slugs, descriptions, icons, tags, target URLs) are defined in a standalone, declarative manifest (`projects.js` or `data.js`). The rendering engine and HUD dynamically instantiate based on this configuration.

## Consequences
- Modifying or adding projects requires updating only the manifest file.
- Total separation between visual presentation logic and content data.
