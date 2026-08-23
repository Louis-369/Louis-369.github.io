# 19. Material & Lighting: Warm Ivory Paper with Grain Overlay and Champagne Gold Foil Accents

Date: 2026-08-23

## Status
Accepted

## Context
The visual atmosphere requires an authentic, high-end editorial tactile depth inspired by luxury art publications (Kinfolk, Cereal, Monolog). The user selected subtle champagne gold accents and a fine paper grain texture overlay.

## Decision
1. **Paper Grain Texture Layer**:
   - Fixed full-viewport SVG/Canvas procedural noise overlay (`pointer-events: none; opacity: 0.045`) simulating physical heavyweight cotton/matte art paper.
2. **Champagne Gold Accent System (隱奢金箔點綴)**:
   - Primary Gold Tokens: `--gold-primary: #C5A059`, `--gold-shimmer: linear-gradient(135deg, #ECC880 0%, #C5A059 50%, #A67C30 100%)`, `--gold-border: rgba(197, 160, 89, 0.25)`.
   - Applied to: Active status pulse dot, interactive button arrow hover, tag borders, floating gold dust particles (Three.js/Canvas ambient micro-sparks), and delicate line accents.
3. **Typography Contrast (WCAG AAA)**:
   - Deep charcoal ink (`--ink-primary: #121316`) against warm ivory background (`#FAF8F5`) maintaining maximum legibility, with gold serving strictly as a luxury accent layer.

## Consequences
- Authentic physical craftsmanship feel, completely breaking away from generic digital templates.
- Subtle and durable aesthetic that remains legible and soothing to read.
