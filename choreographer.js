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
    gsap.set('#water-fluid-canvas', { opacity: 1 }); // Canvas stays active for interactive clicks

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
   * Triggers the authentic 3D Relativistic Accretion Disk & Photon Ring Black Hole burst
   * centered right on the period dot when clicked!
   * 
   * @param {Object} waterAnimator - WebGLFluidWaterAnimation instance.
   */
  triggerBlackHoleBurst(waterAnimator) {
    const gsap = window.gsap;
    if (!gsap || !waterAnimator) return;

    const canvas = document.getElementById('water-fluid-canvas');
    const dotEl = document.getElementById('hero-title-dot');
    if (!canvas || !dotEl) return;

    const c = canvas.getBoundingClientRect();
    const r = dotEl.getBoundingClientRect();
    const cx = r.left + r.width * 0.5;
    const cy = r.top + r.height * 0.5;

    const uv = {
      x: (cx - c.left) / c.width,
      y: 1.0 - (cy - c.top) / c.height
    };

    // Kill any existing burst tween to prevent conflicts
    gsap.killTweensOf(dotEl);

    const burstObj = { power: 0 };
    const burstTl = gsap.timeline();

    // Dot remains perfectly stable at 1.0 (no scaling up), serving as the solid event horizon core
    burstTl.set(dotEl, { scale: 1.0 });

    // WebGL Accretion Disk & Photon Ring surges outward from the dot's exact UV coordinates
    burstTl.to(burstObj, {
      power: 1.0,
      duration: 1.45,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (typeof waterAnimator.triggerCentripetalVortexSink === 'function') {
          waterAnimator.triggerCentripetalVortexSink(uv.x, uv.y, burstObj.power * 6.0);
        }
      }
    });

    // Gravitational suction pulls back and collapses into the dot
    burstTl.to(burstObj, {
      power: 0,
      duration: 0.65,
      ease: 'power3.in',
      onUpdate: () => {
        waterAnimator.sinkForce = burstObj.power;
      }
    });
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
