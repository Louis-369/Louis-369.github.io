# Domain Glossary: Louis Planet Hub (Louis-369.github.io)

## Ubiquitous Language & Core Concepts

### Visual & Atmospheric System
- **Warm Ivory Palette (米白暖色系底蘊)**: Warm cream/off-white background (`#FBF9F5` / `#F5F2EB`) paired with charcoal ink typography (`#1E2022`, `#2C302E`) and subtle earthy/warm accent tones.
- **Point-Cloud Particle Globe (點陣粒子星體)**: A 3D spherical point cloud. Visual distinction:
  - **Continent Cluster (大陸籆落區)**: Randomized mixed-size particle cluster (large + medium + small dots) forming an organic textured landmass shape within the sector region.
  - **Ocean Field (海洋區)**: Uniform fine small particles at consistent low density.
  - **Global Color Shift (全局調色切換)**: On sector or ocean navigation, entire page accent palette smoothly drifts to a corresponding hue set.
- **Cursor Gravity Dimple (游標引力凹陷)**: When the cursor is near or over the globe, particles in the vicinity are displaced radially inward (toward sphere center) proportionally to cursor proximity, creating a smooth organic concave dent. Particles spring back elastically when cursor exits.
- **Kinetic Staging / Dynamic Choreography (背景星體動態運鏡舞台)**: On sector selection, the background point-cloud globe smoothly shifts position (e.g., top-left, bottom-right) to create organic balance with foreground content.
- **Editorial Paper HUD (極簡紙感/編排面板)**: Clean, high-legibility minimalist panels with refined Swiss typography, tactile subtle borders, without heavy dark glassmorphism.

### Responsive Interaction Architecture
- **Desktop Orbit Stage (桌面端動態多錨點舞台)**: Asymmetrical composition where the active sector determines globe position and rotation angle.
- **Mobile Linked Carousel (手機端雙向聯動輪播)**: Top ~40-45vh: interactive particle sphere. Bottom: swipeable continent card carousel that synchronizes globe rotation in real time.

### Data Model & Configuration
- **Sector Manifest (`projects.js`)**: Declarative configuration mapping sector coordinates, labels, themes (per-sector palette hue shift, globe coords, stage position offset), and project nodes.
- **Project Landmark Node**: Individual project record: title, summary, direct url, repository link, category tags, optional live metrics.
