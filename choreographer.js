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
   * Plays the calligraphy brush descent and Suminagashi vortex suction opening sequence.
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
    gsap.set('.hero-title-line', { opacity: 0, scale: 0.98 });
    gsap.set(['.site-nav', '.hero-dictionary-entry', '.hero-scroll-indicator'], { y: 25, opacity: 0 });
    
    gsap.set('.craft-pen-wrap', {
      y: -window.innerHeight * 0.55,
      x: 0,
      rotation: 0,
      scale: 1.05,
      opacity: 0
    });
    gsap.set('.craft-pen-shadow', {
      scale: 0.1,
      opacity: 0,
      y: 40
    });

    const revealTl = gsap.timeline({
      onComplete: () => {
        if (waterAnimator) waterAnimator.destroy();
        const canvas = document.getElementById('water-fluid-canvas');
        if (canvas) canvas.style.display = 'none';
        const pen = document.getElementById('craft-pen-wrap');
        if (pen) pen.remove();
        gsap.set(['.hero-title-line', '.hero-dictionary-entry', '.site-nav', '.hero-scroll-indicator'], { opacity: 1, y: 0 });
        this.initLenis();
        this.initScrollAnimations();
        this.onRevealComplete();
      }
    });

    // Optical alignment: measure exact vertical center of hero title
    const titleEl = document.getElementById('hero-title-line');
    let penLandingY = 0;
    if (titleEl) {
      const tRect = titleEl.getBoundingClientRect();
      penLandingY = (tRect.top + tRect.height * 0.46) - (window.innerHeight * 0.5);
    }

    // Phase 1: Brush vertical descent
    revealTl.to('.craft-pen-wrap', {
      y: penLandingY,
      opacity: 1,
      duration: 1.3,
      ease: 'power3.out'
    });

    revealTl.to('.craft-pen-shadow', {
      scale: 1.0,
      opacity: 0.9,
      duration: 1.3,
      ease: 'power3.out'
    }, '<');

    // Phase 2: Brush tip contact and multi-wave ink release
    revealTl.to('.craft-pen-wrap', {
      y: penLandingY + 12,
      scaleY: 0.93,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        if (waterAnimator && typeof waterAnimator.spawnDrop === 'function') {
          if (typeof waterAnimator.initTextTexture === 'function') {
            waterAnimator.initTextTexture();
          }
          waterAnimator.spawnDrop(0.5, 0.5, waterAnimator.INKS[0], 1.35);
          
          setTimeout(() => {
            if (waterAnimator) waterAnimator.spawnDrop(0.504, 0.497, waterAnimator.INKS[1], 1.15);
          }, 140);

          setTimeout(() => {
            if (waterAnimator) waterAnimator.spawnDrop(0.496, 0.503, waterAnimator.INKS[2] || waterAnimator.INKS[0], 1.15);
          }, 280);

          setTimeout(() => {
            if (waterAnimator) waterAnimator.spawnDrop(0.50, 0.50, waterAnimator.INKS[1], 0.90);
          }, 400);
        }
      }
    });

    // Phase 3: Brush fade-out
    revealTl.to('.craft-pen-wrap', {
      opacity: 0,
      y: penLandingY - 14,
      duration: 0.58,
      ease: 'power2.out'
    }, '+=0.05');

    revealTl.to('.craft-pen-shadow', {
      opacity: 0,
      scale: 0.1,
      duration: 0.50,
      ease: 'power2.out'
    }, '<');

    if (waterAnimator) {
      waterAnimator.textOpacity = 0.0;
      revealTl.to(waterAnimator, {
        textOpacity: 1.0,
        duration: 1.3,
        ease: 'power2.out'
      }, '-=0.3');
    }

    /**
     * Calculates UV coordinates of the title period dot relative to the WebGL canvas.
     * @returns {{x: number, y: number}}
     */
    function getDotUV() {
      const canvas = document.getElementById('water-fluid-canvas');
      const dotEl = document.getElementById('hero-title-dot');
      if (!canvas || !dotEl) return { x: 0.5, y: 0.5 };

      const c = canvas.getBoundingClientRect();
      const r = dotEl.getBoundingClientRect();
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.5;

      return {
        x: (cx - c.left) / c.width,
        y: 1.0 - (cy - c.top) / c.height
      };
    }

    // Phase 4: Vortex sink suction into the period dot
    revealTl.to('#hero-title-dot', {
      scale: 1.40,
      duration: 0.85,
      ease: 'power2.out'
    }, '+=1.15');

    const suctionObj = { power: 0, wash: 0 };
    revealTl.to(suctionObj, {
      power: 1,
      wash: 1,
      duration: 2.0,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (waterAnimator && typeof waterAnimator.triggerCentripetalVortexSink === 'function') {
          const uv = getDotUV();
          waterAnimator.triggerCentripetalVortexSink(uv.x, uv.y, suctionObj.power * 6.0);
          waterAnimator.washProgress = Math.pow(suctionObj.wash, 1.35);
        }
      }
    }, '<');

    // Phase 5: Dot accretion disk collapses and DOM title takes over
    revealTl.to('#hero-title-dot', {
      scale: 1.0,
      duration: 0.65,
      ease: 'back.out(1.4)'
    }, '-=0.4');

    revealTl.to('.hero-title-line', {
      opacity: 1,
      scale: 1.0,
      duration: 0.8,
      ease: 'power2.out'
    }, '<');

    revealTl.to('#water-fluid-canvas', {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut'
    }, '-=0.5');

    // Phase 6: Supporting hero elements & navigation cascade in
    revealTl.to('.site-nav', {
      y: 0,
      opacity: 1,
      duration: 1.0,
      ease: 'power3.out'
    }, '-=0.6');

    revealTl.to(['.hero-dictionary-entry', '.hero-scroll-indicator'], {
      y: 0,
      opacity: 1,
      stagger: 0.12,
      duration: 1.0,
      ease: 'power3.out'
    }, '-=0.8');
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

    // 4. Navigation dark/light surface theme toggle
    const siteNav = document.querySelector('.site-nav');
    const aboutEl = document.getElementById('about');
    if (siteNav && aboutEl) {
      ScrollTrigger.create({
        trigger: aboutEl,
        start: 'top 60px',
        end: 'bottom 60px',
        toggleClass: { targets: siteNav, className: 'is-dark-theme' }
      });
    }
  }
}
