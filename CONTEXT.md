# Domain Glossary: Louis Editorial Studio Hub (Louis-369.github.io)

## Ubiquitous Language & Core Concepts

### Atmospheric & Layout System
- **Warm Ivory Paper Canvas (米白紙感底蘊)**: Warm cream/off-white background (`#F9F8F5` / `#F3F0EA`) with high-contrast charcoal ink typography (`#121316`, `#2B2D33`).
- **Paper-Cut Framing (剪紙透視相框)**: Editorial 12-column open showcase grid with crisp rounded borders and scroll-driven image zoom parallax (`.works-home-item`).
- **Scroll-Driven Image Mask Parallax**: GSAP ScrollTrigger scrub pipeline that shifts inner images on vertical scroll (`yPercent: -15 -> 15`).
- **Lenis Smooth Engine (慣性平滑滾動)**: Butter-smooth inertial scrolling physics synchronized with the GSAP ticker.
- **Editorial Typography Stack**: `Noto Serif TC` (Editorial serif) + `Playfair Display` + `Inter` + `Geist Mono`.
- **Monolog-Style Nav & Button Kinetics**: Zero-lag native cursor with rolling double-layer text transform (`translateY(-1.2em)`), diagonal flying arrow boxes, and elastic pill hover response.

### Core Content & Interactive Engines
- **Suminagashi WebGL Fluid Engine (`fluid-engine.js`)**: Real Navier-Stokes multi-pass Ping-Pong FBO fluid simulation executing ink dispersion, Poisson pressure solving, Beer-Lambert dye dynamics, and linear vacuum suction into the typographic period dot.
- **GSAP Animation Choreographer (`choreographer.js`)**: Coordinates the 6-phase opening sequence, reduced-motion fallbacks, section reveals, and navigation surface theme toggling (`is-dark-theme`).
- **Timed Ethos Story Slider (`app.js`)**: 6.0s continuous auto-play progress bar countdown with fast-forward click rush (`scaleX: 1` over 0.2s) and split-text staggered word-mask roll flip transitions.
- **Psychic Silver Spoon Easter Egg (`#footer-spoon-trigger`)**: 45-degree elliptical cutlery spoon with interactive quadratic Bézier handle deflection on mouse movement, elastic rebound, and violent 90-degree kink on click leading into the Matrix.
- **Matrix Digital Rain Engine (`matrix.js`)**: Full-screen 60fps HTML5 canvas digital waterfall with tri-lingual token pool (Assembly, Chinese philosophy, Japanese katakana/kanji), cursor magnetic repulsion, and deliberate typewriter intro.
