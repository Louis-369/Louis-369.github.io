# 8. Global Palette Shift: Subtle Tonal Drift

Date: 2026-08-20

## Status
Accepted

## Context
When navigating between continental sectors, the page needs atmospheric feedback that reinforces spatial identity without breaking the warm ivory editorial coherence.

## Decision
**Subtle Tonal Drift** via CSS custom property animation (driven by GSAP):
- Base background (`--bg`) always stays in the warm ivory family (`#FBF9F5` – `#F0EBE1`) — never departs radically.
- Each sector defines a subtle `--sector-hue-shift` CSS variable: a gentle tint overlay that nudges the globe particle accent color and UI micro-accents (underlines, hover states, tag borders).
- Example drifts:
  - AI & Cognitive Sector → faint lavender-cool shift (`+5° hue toward blue-violet`)
  - Creative & Media Sector → faint warm amber-sand shift (`-10° hue toward orange`)
  - Core Utility Labs → faint moss-slate shift
  - Hub / Base → neutral warm default
  - Ocean transition → faint glacial blue-grey tint
- Transition duration: ~800ms with `power2.inOut` easing (GSAP).

## Consequences
- Never jarring; feels like natural light changing through a window.
- Preserves warm ivory editorial identity across all states.
- Technically clean: only 2–3 CSS variables need to be tweened per sector switch.
