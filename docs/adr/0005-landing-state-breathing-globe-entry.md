# 5. Landing State: Breathing Globe Entry

Date: 2026-08-20

## Status
Accepted

## Context
The first 3 seconds of any visitor's experience determines whether they stay and explore. We need to define the default landing composition before any sector is selected.

## Decision
**Breathing Globe Entry** pattern:
1. Warm ivory canvas loads instantly (CSS-only, zero render delay).
2. Point-cloud particle globe fades in from center, gently auto-rotating (continuous subtle spin, like breathing).
3. A minimal personal signature text line fades in above/below (e.g. `Louis · Developer & Creator`) with refined typographic animation.
4. Four minimal sector navigation anchors appear at the bottom, inviting the visitor to select a continent.
5. On sector selection, globe begins kinetic position shift and full-page palette transition.

## Consequences
- Mysterious and inviting first impression without confusing the visitor.
- Globe auto-rotation keeps the scene alive without requiring user interaction.
- Clear progressive disclosure: globe first, identity second, navigation third.
