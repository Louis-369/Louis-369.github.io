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

    // 1. (0.0s - 1.6s) Brush descends vertically at exact center
    revealTl.to('.craft-pen-wrap', {
      y: 0,
      opacity: 1,
      duration: 1.6,
      ease: 'power3.out'
    });

    revealTl.to('.craft-pen-shadow', {
      scale: 1.0,
      opacity: 0.9,
      y: 0,
      duration: 1.6,
      ease: 'power3.out'
    }, '<');

    // 2. (1.6s - 2.2s) Brush Tip "Dips" Water Center -> Drops Real GPU Fluid Ink
    revealTl.to('.craft-pen-wrap', {
      y: 12,
      scaleY: 0.94, // Soft bristle flexion
      duration: 0.35,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1,
      onStart: () => {
        if (waterAnimator && typeof waterAnimator.spawnDrop === 'function') {
          waterAnimator.spawnDrop(0.5, 0.5, waterAnimator.INKS[0]);
          setTimeout(() => {
            if (waterAnimator) waterAnimator.spawnDrop(0.51, 0.49, waterAnimator.INKS[1]);
          }, 300);
        }
      }
    });

    // Suminagashi Water Emerging Brand "Louis."
    revealTl.to('.zen-brand-emerge', {
      opacity: 1,
      scale: 1,
      y: -85,
      duration: 1.4,
      ease: 'power2.out'
    }, '-=0.2');

    // 3. (2.2s - 3.6s) Brush smoothly lifts and glides to the FAR LEFT edge of the screen
    revealTl.to('.craft-pen-wrap', {
      x: -window.innerWidth * 0.44, // Glides to leftmost edge
      y: -20,
      rotation: -14, // Tilts inward ready to sweep
      duration: 1.4,
      ease: 'power2.inOut'
    }, '-=0.8');

    // 4. (3.6s - 5.2s) Option A: Brush Nib physically wipes the curtain open via Dynamic Clip-Path
    const sweepProgress = { p: 0 };
    revealTl.to('.craft-pen-wrap', {
      x: window.innerWidth * 0.50, // Sweeps across to far right beyond screen edge
      y: 15,
      rotation: 22,
      opacity: 1, // Keep solid until finish!
      duration: 1.6,
      ease: 'power2.inOut'
    }, '+=0.2');

    revealTl.to(sweepProgress, {
      p: 1,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        const p = sweepProgress.p;
        // Screen percentage from 0% to 100%
        const cutX = Math.max(0, Math.min(100, p * 105));
        
        // Curtain clip-path physically peels away exactly behind the brush nib
        const curtain = document.getElementById('zen-leaf-curtain');
        if (curtain) {
          curtain.style.clipPath = `polygon(${cutX}% 0%, 100% 0%, 100% 100%, ${cutX}% 100%)`;
        }

        if (waterAnimator && typeof waterAnimator.sweepHorizontalFlow === 'function') {
          const currentX = 0.05 + p * 0.90;
          const currentY = 0.5 - Math.sin(p * Math.PI) * 0.05;
          waterAnimator.sweepHorizontalFlow(currentX, currentY, 1.2);
        }
      }
    }, '<');

    // Brand is wiped away synchronously as the brush crosses center
    revealTl.to('.zen-brand-emerge', {
      opacity: 0,
      scale: 1.05,
      duration: 0.6,
      ease: 'power1.out'
    }, '-=0.9');

    // Brush fades out only after reaching far right edge
    revealTl.to('.craft-pen-wrap', {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out'
    }, '-=0.2');
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
