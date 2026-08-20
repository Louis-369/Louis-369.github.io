/**
 * choreographer.js - GSAP Dynamic Choreography & Kinetic Timelines
 * 
 * Orchestrates:
 * - Landing Entry Sequence (Globe fade → Signature text → Sector anchors)
 * - Sector Activation Stagger (Globe offset + 70% Cards Layer Stagger + Tonal Drift)
 * - Deactivation & Return Choreography
 */

import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

export class SceneChoreographer {
  constructor(domElements = {}) {
    this.dom = domElements;
    this.currentSectorId = null;
    this.isTransitioning = false;
  }

  /**
   * Initial Landing Sequence
   */
  playLandingEntry() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Ensure elements are in initial state
    gsap.set(this.dom.canvas, { opacity: 0, scale: 0.92 });
    gsap.set(this.dom.landingContainer, { opacity: 0, y: 20 });
    gsap.set(this.dom.ambientNav, { opacity: 0, y: 15 });
    gsap.set(this.dom.topbar, { opacity: 0 });
    gsap.set(this.dom.coordsWidget, { opacity: 0 });

    tl.to(this.dom.canvas, {
      opacity: 1,
      scale: 1,
      duration: 1.6,
      ease: 'power2.out'
    })
    .to(this.dom.topbar, {
      opacity: 1,
      duration: 0.8
    }, '-=1.0')
    .to(this.dom.coordsWidget, {
      opacity: 1,
      duration: 0.8
    }, '-=0.8')
    .to(this.dom.landingContainer, {
      opacity: 1,
      y: 0,
      duration: 1.0
    }, '-=0.6')
    .to(this.dom.ambientNav, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1
    }, '-=0.4');

    return tl;
  }

  /**
   * Activate a Continental Sector
   */
  activateSector(sector, globe) {
    if (this.isTransitioning || this.currentSectorId === sector.id) return;
    this.isTransitioning = true;
    this.currentSectorId = sector.id;

    const isMobile = window.innerWidth <= 768;

    // 1. Tell globe to rotate and shift position
    globe.rotateTo(sector.globeCoords.lat, sector.globeCoords.lon);
    
    if (isMobile) {
      // On mobile, keep globe centered on upper half
      globe.setStageOffset(0, -window.innerHeight * 0.12, 0.72);
    } else {
      globe.setStageOffset(sector.stageOffset.x, sector.stageOffset.y, sector.stageOffset.scale);
    }
    
    globe.setSectorAccent(sector.hueShift.dotAccent);

    // 2. Global Palette Tonal Drift via GSAP CSS Variables
    gsap.to(document.documentElement, {
      '--bg-color': sector.hueShift.bg,
      '--accent-color': sector.hueShift.accent,
      '--card-border-accent': sector.hueShift.border,
      duration: 0.8,
      ease: 'power2.inOut'
    });

    // 3. Coordinate timeline for UI transitions
    const tl = gsap.timeline({
      onComplete: () => {
        this.isTransitioning = false;
      }
    });

    // Fade out landing text
    tl.to(this.dom.landingContainer, {
      opacity: 0,
      y: -15,
      duration: 0.4,
      display: 'none'
    });

    // Switch active sector indicator in nav
    this.dom.navButtons.forEach(btn => {
      if (btn.dataset.sector === sector.id) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Prepare Sector Details Container
    this.dom.sectorContainer.style.display = 'flex';
    gsap.set(this.dom.sectorContainer, { opacity: 1 });

    const header = this.dom.sectorContainer.querySelector('.sector-header');
    const cards = this.dom.sectorContainer.querySelectorAll('.project-card');
    const backBtn = this.dom.sectorContainer.querySelector('.back-anchor');

    // Hide cards initially for staggered entrance
    gsap.set([header, backBtn], { opacity: 0, y: 15 });
    gsap.set(cards, { opacity: 0, y: 30 });

    tl.to([backBtn, header], {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power3.out'
    }, '-=0.1')
    .to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    }, '-=0.3');
  }

  /**
   * Return from Sector View to Central Landing State
   */
  deactivateSector(globe) {
    if (this.isTransitioning || !this.currentSectorId) return;
    this.isTransitioning = true;
    this.currentSectorId = null;

    // Reset globe
    globe.resetToResting();

    // Reset palette
    gsap.to(document.documentElement, {
      '--bg-color': '#FAF8F5',
      '--accent-color': '#7C3AED',
      '--card-border-accent': 'rgba(0, 0, 0, 0.07)',
      duration: 0.8,
      ease: 'power2.inOut'
    });

    // Clear active states in nav
    this.dom.navButtons.forEach(btn => btn.classList.remove('active'));

    const tl = gsap.timeline({
      onComplete: () => {
        this.dom.sectorContainer.style.display = 'none';
        this.isTransitioning = false;
      }
    });

    // Fade out sector content
    tl.to(this.dom.sectorContainer, {
      opacity: 0,
      y: 15,
      duration: 0.35,
      ease: 'power2.in'
    });

    // Fade back in landing text
    this.dom.landingContainer.style.display = 'flex';
    tl.to(this.dom.landingContainer, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.1');
  }
}
