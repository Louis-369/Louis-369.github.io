/**
 * choreographer.js - GSAP Animation Orchestrator & Smooth Scroll Engine
 * 
 * 1. s0animation-style 1:1 expanding viewport reveal
 * 2. Lenis Smooth Scroll binding with GSAP ticker
 * 3. bymonolog-style Stacking Paper-Cut Cards & Parallax Window Portals
 * 4. Split-line typography entrances
 */

export class Choreographer {
  constructor(options = {}) {
    this.lenis = null;
    this.onRevealComplete = options.onRevealComplete || (() => {});
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Initialize Lenis Smooth Scrolling and hook into GSAP ticker
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

    // Connect Lenis to GSAP ScrollTrigger
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
   * Calligraphy Brush & Suminagashi Fluid Opening Reveal (5.5s Masterpiece Sequence)
   * 1. Calligraphy Brush descends vertically from above (0.0s - 1.6s)
   * 2. Brush Tip "Dips" water center -> Suminagashi Beer-Lambert Ink Marbling -> "Louis." emerges (1.6s - 3.5s)
   * 3. Brush sweeps gracefully across the screen (Gentle Horizontal Sweep) -> wipes & washes ink (3.5s - 4.6s)
   * 4. Ink washes clean into warm ivory canvas -> Editorial Homepage Opens! (4.6s - 5.5s)
   */
  playOpeningReveal(waterAnimator = null) {
    const gsap = window.gsap;
    if (!gsap) {
      console.warn('GSAP not loaded.');
      return;
    }

    if (this.prefersReducedMotion) {
      const curtain = document.getElementById('zen-leaf-curtain');
      if (curtain) curtain.remove();
      gsap.set(['.hero-title-line', '.hero-badge', '.hero-tagline', '.site-nav', '.hero-scroll-prompt'], { opacity: 1, y: 0 });
      this.initLenis();
      this.initScrollAnimations();
      this.onRevealComplete();
      return;
    }

    // Initial Elements Setup: All Hero elements initially HIDDEN!
    gsap.set('.hero-title-line', { opacity: 0, scale: 0.98 });
    gsap.set('#hero-title-dot', { opacity: 0 }); // Dot starts as pure WebGL liquid ink!
    gsap.set(['.site-nav', '.hero-badge', '.hero-tagline', '.hero-scroll-prompt'], { y: 25, opacity: 0 });
    
    // Calligraphy Brush starting state: Poised directly above center
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
        gsap.set(['.hero-title-line', '#hero-title-dot', '.hero-badge', '.hero-tagline', '.site-nav', '.hero-scroll-prompt'], { opacity: 1, y: 0 });
        this.initLenis();
        this.initScrollAnimations();
        this.onRevealComplete();
      }
    });

    // 1. (0.0s - 1.5s) Brush descends vertically with Zen stillness
    revealTl.to('.craft-pen-wrap', {
      y: 0,
      opacity: 1,
      duration: 1.5,
      ease: 'power3.out'
    });

    revealTl.to('.craft-pen-shadow', {
      scale: 1.0,
      opacity: 0.9,
      y: 0,
      duration: 1.5,
      ease: 'power3.out'
    }, '<');

    // 2. (1.5s - 2.1s) Brush Tip "Dips" Water -> Ink Drops into Water Center!
    revealTl.to('.craft-pen-wrap', {
      y: 12,
      scaleY: 0.94, // Soft bristle flexion
      duration: 0.3,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1,
      onStart: () => {
        if (waterAnimator && typeof waterAnimator.spawnDrop === 'function') {
          waterAnimator.spawnDrop(0.5, 0.5, waterAnimator.INKS[0]);
          setTimeout(() => {
            if (waterAnimator) waterAnimator.spawnDrop(0.505, 0.495, waterAnimator.INKS[1]);
          }, 250);
        }
      }
    });

    // Louis emerges gracefully from under water, while the dot is pure liquid ink!
    revealTl.to('.hero-title-line', {
      opacity: 1,
      scale: 1.0,
      duration: 1.2,
      ease: 'power2.out'
    }, '-=0.2');

    // 3. (2.2s - 3.2s) Brush lifts upwards and pulls back into the top-right
    revealTl.to('.craft-pen-wrap', {
      x: window.innerWidth * 0.35,
      y: -window.innerHeight * 0.45,
      rotation: 35,
      opacity: 0,
      duration: 1.1,
      ease: 'power2.in'
    }, '+=0.1');

    revealTl.to('.craft-pen-shadow', {
      scale: 0.1,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.in'
    }, '<');

    // 4. (2.5s - 4.2s) PURE GPU FLUID VORTEX SINK AT THE DOT POSITION!
    const suctionObj = { power: 0, wash: 0 };
    revealTl.to(suctionObj, {
      power: 1,
      wash: 1,
      duration: 1.8,
      ease: 'power2.inOut',
      onStart: () => {
        if (waterAnimator && typeof waterAnimator.spawnDrop === 'function') {
          const dotEl = document.getElementById('hero-title-dot');
          let dotX = 0.58;
          let dotY = 0.50;
          if (dotEl) {
            const rect = dotEl.getBoundingClientRect();
            dotX = (rect.left + rect.width * 0.5) / window.innerWidth;
            dotY = 1.0 - (rect.top + rect.height * 0.5) / window.innerHeight;
          }
          // Spawn physical ink drop precisely at the dot location
          waterAnimator.spawnDrop(dotX, dotY, waterAnimator.INKS[0]);
        }
      },
      onUpdate: () => {
        if (waterAnimator && typeof waterAnimator.triggerCentripetalVortexSink === 'function') {
          const dotEl = document.getElementById('hero-title-dot');
          let dotX = 0.58;
          let dotY = 0.50;
          if (dotEl) {
            const rect = dotEl.getBoundingClientRect();
            dotX = (rect.left + rect.width * 0.5) / window.innerWidth;
            dotY = 1.0 - (rect.top + rect.height * 0.5) / window.innerHeight;
          }
          // Tamed elegant Navier-Stokes GPU Swirling Pull into the dot
          waterAnimator.triggerCentripetalVortexSink(dotX, dotY, suctionObj.power * 2.8);
          waterAnimator.washProgress = Math.pow(suctionObj.wash, 1.5);
        }
      }
    }, '-=0.4');

    // 5. (3.8s - 4.5s) Liquid Ink Solidifies into the Typographic Period Dot '.'
    revealTl.to('#hero-title-dot', {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.4');

    // 6. (4.0s - 4.8s) Water Fluid Canvas cleanly completes absorption
    revealTl.to('#water-fluid-canvas', {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut'
    }, '-=0.5');

    // 7. (4.2s - 5.0s) Supporting Hero Elements & Navbar Gracefully Cascade In
    revealTl.to('.site-nav', {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out'
    }, '-=0.6');

    revealTl.to(['.hero-badge', '.hero-tagline', '.hero-scroll-prompt'], {
      y: 0,
      opacity: 1,
      stagger: 0.08,
      duration: 0.9,
      ease: 'power3.out'
    }, '-=0.7');
  }

  /**
   * bymonolog-style Paper-Cut Stacking Cards with GSAP ScrollTrigger
   */
  initScrollAnimations() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;

    // 1. Hero scroll out parallax
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

    // 2. Section Headings Split Reveal
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

    // 3. 1:1 bymonolog.com Scroll-Driven Image Mask Parallax Scrub
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
