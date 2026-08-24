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

    // Initial Elements Setup: Set homepage content visible underneath
    gsap.set(['.site-nav', '.hero-badge', '.hero-tagline', '.hero-scroll-prompt'], { y: 0, opacity: 1 });
    gsap.set('.hero-title-line', { y: '0%', opacity: 1 });
    
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
    gsap.set('.zen-brand-emerge', {
      scale: 0.9,
      y: 20,
      opacity: 0
    });
    gsap.set('#zen-leaf-curtain', {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      opacity: 1
    });

    const revealTl = gsap.timeline({
      onComplete: () => {
        if (waterAnimator) waterAnimator.destroy();
        const curtain = document.getElementById('zen-leaf-curtain');
        if (curtain) curtain.remove();
        this.initLenis();
        this.initScrollAnimations();
        this.onRevealComplete();
      }
    });

    // 1. (0.0s - 1.5s) Brush descends vertically directly positioned above letter 'o'
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

    // 2. (1.5s - 2.1s) Brush Tip "Dips" Water -> Drops Real GPU Fluid Ink at exact location
    revealTl.to('.craft-pen-wrap', {
      y: 12,
      scaleY: 0.94, // Soft bristle flexion
      duration: 0.3,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1,
      onStart: () => {
        if (waterAnimator && typeof waterAnimator.spawnDrop === 'function') {
          // Calculate exact real-time pen tip location on screen
          const penEl = document.getElementById('craft-pen-wrap');
          let tipX = 0.5;
          let tipY = 0.5;
          if (penEl) {
            const rect = penEl.getBoundingClientRect();
            tipX = (rect.left + rect.width * 0.5) / window.innerWidth;
            tipY = 1 - (rect.bottom) / window.innerHeight; // WebGL Y is inverted
          }
          waterAnimator.spawnDrop(tipX, tipY, waterAnimator.INKS[0]);
          setTimeout(() => {
            if (waterAnimator) waterAnimator.spawnDrop(tipX + 0.005, tipY - 0.005, waterAnimator.INKS[1]);
          }, 250);
        }
      }
    });

    // Mirror Title Emerges: 1:1 Pixel-Identical with Hero Section Title
    revealTl.to('.zen-opening-title', {
      opacity: 1,
      duration: 1.3,
      ease: 'power2.out'
    }, '-=0.2');

    // 3. (2.1s - 3.2s) Brush lifts upwards and pulls back into the top-right
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

    // 4. (2.8s - 4.4s) LETTER "O" POWERFUL CENTRIPETAL BLACK HOLE VORTEX SUCTION!
    revealTl.to('.letter-o-sink', {
      scale: 1.35,
      duration: 0.4,
      ease: 'power2.out',
      yoyo: true,
      repeat: 3
    }, '-=0.3');

    const vortexObj = { power: 0, wash: 0 };
    revealTl.to(vortexObj, {
      power: 1,
      wash: 1,
      duration: 1.5,
      ease: 'power3.inOut',
      onUpdate: () => {
        if (waterAnimator && typeof waterAnimator.triggerCentripetalVortexSink === 'function') {
          // Get exact screen normalized coordinates of the letter 'o'
          const oEl = document.getElementById('letter-o-sink');
          let targetX = 0.50;
          let targetY = 0.50;
          if (oEl) {
            const rect = oEl.getBoundingClientRect();
            targetX = (rect.left + rect.width * 0.5) / window.innerWidth;
            targetY = 1 - (rect.top + rect.height * 0.5) / window.innerHeight;
          }

          // Massive inward suction force (power * 3.5) pulling all fluid into O
          waterAnimator.triggerCentripetalVortexSink(targetX, targetY, vortexObj.power * 3.5);
          waterAnimator.washProgress = Math.pow(vortexObj.wash, 1.5);
        }
      }
    }, '<');

    // 5. (4.2s - 4.9s) Curtain vanishes seamlessly revealing the identical Hero Section
    revealTl.to('#zen-leaf-curtain', {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut'
    }, '-=0.3');
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
