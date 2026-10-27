/**
 * @file choreographer.js
 * @description GSAP animation choreography and Lenis smooth scroll coordinator.
 * Orchestrates opening Suminagashi calligraphy reveal and ScrollTrigger parallax pipelines.
 */

export class Choreographer {
  /**
   * @param {Object} options
   * @param {Function} [options.onRevealComplete] - Callback fired when initial reveal completes.
   */
  constructor(options = {}) {
    this.lenis = null;
    this.onRevealComplete = options.onRevealComplete || (() => {});
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Initializes Lenis smooth scrolling and synchronizes with GSAP ticker.
   */
  initLenis() {
    if (typeof window.Lenis === 'undefined') {
      console.warn('Lenis library not loaded, falling back to native scroll.');
      return;
    }

    this.lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false
    });

    if (window.gsap && window.ScrollTrigger) {
      this.lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add((time) => {
        this.lenis.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        this.lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  }

  /**
   * Fast, clean editorial opening reveal.
   * Directly stages the hero typography and UI chrome with a gentle, premium fade.
   * The interactive Black Hole Accretion Disk is attached to clicking the period dot!
   * 
   * @param {Object|null} waterAnimator - WebGLFluidWaterAnimation instance.
   */
  playOpeningReveal(waterAnimator = null) {
    const gsap = window.gsap;
    if (!gsap) {
      console.warn('GSAP not loaded.');
      return;
    }

    if (this.prefersReducedMotion) {
      gsap.set(['.hero-title-line', '.hero-dictionary-entry', '.site-nav', '.hero-scroll-indicator'], { opacity: 1, y: 0 });
      this.initLenis();
      this.initScrollAnimations();
      this.onRevealComplete();
      return;
    }

    // Initial state: hide hero typography and UI chrome
    gsap.set('.hero-title-line', { opacity: 0, y: 16 });
    gsap.set(['.site-nav', '.hero-dictionary-entry', '.hero-scroll-indicator'], { y: 20, opacity: 0 });

    const revealTl = gsap.timeline({
      onComplete: () => {
        gsap.set(['.hero-title-line', '.hero-dictionary-entry', '.site-nav', '.hero-scroll-indicator'], { opacity: 1, y: 0 });
        this.initLenis();
        this.initScrollAnimations();
        this.onRevealComplete();
      }
    });

    // 1. Louis. Title line fades up smoothly
    revealTl.to('.hero-title-line', {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out'
    }, '+=0.1');

    // 2. Navigation bar cascades in
    revealTl.to('.site-nav', {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.5');

    // 3. Dictionary entry and bottom scroll prompt reveal
    revealTl.to(['.hero-dictionary-entry', '.hero-scroll-indicator'], {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.6');
  }

  /**
   * Triggers the 100% self-contained 3D Accretion Disk & Photon Ring Black Hole burst
   * and 1.5s gravitational lensing pull on surrounding text!
   */
  triggerBlackHoleBurst() {
    const gsap = window.gsap;
    if (!gsap) return;

    const halo = document.getElementById('hero-void-halo');
    const disk = document.getElementById('hero-disk-system');
    const textEl = document.querySelector('.hero-title-line .js-grav-text');
    const subEl = document.querySelector('.hero-dictionary-entry');

    if (!halo || !disk) return;

    gsap.killTweensOf([halo, disk, textEl, subEl]);

    const tl = gsap.timeline();

    // Phase 1: Accretion Disk & Photon Ring burst open from the '.' itself
    tl.to(halo, {
      scale: 1,
      opacity: 1,
      duration: 0.38,
      ease: "power3.out"
    }, 0);

    tl.to(disk, {
      scale: 1,
      opacity: 1,
      duration: 0.45,
      ease: "back.out(1.6)"
    }, 0);

    // Surrounding 'Louis' text & dictionary entry get pulled toward the black hole dot
    if (textEl) {
      tl.to(textEl, {
        x: 9,
        skewX: -3.5,
        scale: 0.975,
        duration: 0.55,
        ease: "power2.out"
      }, 0);
    }

    if (subEl) {
      tl.to(subEl, {
        y: -4,
        scale: 0.985,
        duration: 0.55,
        ease: "power2.out"
      }, 0);
    }

    // Phase 2: Hold singularity for ~1.1s while ring spins at high speed, then collapse back into '.'
    tl.to(disk, {
      scale: 0,
      opacity: 0,
      duration: 0.42,
      ease: "power3.in"
    }, 1.45);

    tl.to(halo, {
      scale: 0,
      opacity: 0,
      duration: 0.42,
      ease: "power3.in"
    }, 1.45);

    // Text snaps back to equilibrium with crisp elasticity
    if (textEl) {
      tl.to(textEl, {
        x: 0,
        skewX: 0,
        scale: 1,
        duration: 0.85,
        ease: "elastic.out(1.2, 0.4)"
      }, 1.55);
    }

    if (subEl) {
      tl.to(subEl, {
        y: 0,
        scale: 1,
        duration: 0.75,
        ease: "back.out(1.8)"
      }, 1.55);
    }
  }

  /**
   * Initializes scroll-driven animations (Hero parallax, card image zoom, dark theme toggle).
   */
  initScrollAnimations() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;

    // 1. Hero scroll-out parallax
    gsap.to('.hero-content-wrap', {
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6
      },
      y: 120,
      opacity: 0.3
    });

    // 2. Section headings reveal
    document.querySelectorAll('.section-heading-split').forEach((heading) => {
      gsap.from(heading, {
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out'
      });
    });

    // 3. Showcase image mask parallax scrub
    const workItems = gsap.utils.toArray('.works-home-item');
    workItems.forEach((item) => {
      const showcaseImg = item.querySelector('.works-home-image');
      if (showcaseImg) {
        gsap.fromTo(showcaseImg, 
          {
            yPercent: -15,
            scale: 1.15
          },
          {
            yPercent: 15,
            scale: 1.15,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8
            }
          }
        );
      }
    });
  }
}
