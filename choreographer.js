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
   * s0animation 1:1 Viewport Reveal Animation Sequence
   * Concentrated Center Box -> Explosive Clip-Path Expand -> Counter-Scale Zoom -> Typography Stagger
   */
  playOpeningReveal() {
    const gsap = window.gsap;
    if (!gsap) {
      console.warn('GSAP not loaded.');
      return;
    }

    if (this.prefersReducedMotion) {
      gsap.set('.hero-viewport-frame', { clipPath: 'inset(0% 0% 0% 0% round 0px)', scale: 1 });
      gsap.set('.hero-media-inner', { scale: 1 });
      gsap.set(['.hero-title-line', '.hero-badge', '.hero-tagline', '.site-nav', '.hero-scroll-prompt'], { opacity: 1, y: 0 });
      this.initLenis();
      this.initScrollAnimations();
      this.onRevealComplete();
      return;
    }

    // Initial state: Central floating paper frame
    gsap.set('.hero-viewport-frame', {
      clipPath: 'inset(22% 26% 22% 26% round 24px)',
      scale: 0.96,
      opacity: 1
    });
    gsap.set('.hero-media-inner', {
      scale: 1.35
    });
    gsap.set('.hero-title-line', {
      y: '105%',
      opacity: 0
    });
    gsap.set(['.hero-badge', '.hero-tagline', '.hero-scroll-prompt', '.site-nav'], {
      y: 24,
      opacity: 0
    });
    gsap.set('.preloader-center-badge', {
      opacity: 1,
      scale: 1
    });

    const revealTl = gsap.timeline({
      delay: 0.2,
      onComplete: () => {
        this.initLenis();
        this.initScrollAnimations();
        this.onRevealComplete();
      }
    });

    // Phase 1: Hold focus on center badge (0.0 - 0.6s)
    revealTl.to('.preloader-center-badge', {
      opacity: 0,
      scale: 0.9,
      duration: 0.45,
      ease: 'power2.inOut',
      delay: 0.4
    });

    // Phase 2: Explosive Viewport Expand & Lens Zoom-Out (0.6 - 1.8s)
    // Using cubic-bezier(0.83, 0, 0.17, 1) equivalent via power4.inOut
    revealTl.to('.hero-viewport-frame', {
      clipPath: 'inset(0% 0% 0% 0% round 0px)',
      scale: 1.0,
      duration: 1.45,
      ease: 'power4.inOut'
    }, '-=0.15');

    revealTl.to('.hero-media-inner', {
      scale: 1.0,
      duration: 1.45,
      ease: 'power4.inOut'
    }, '<');

    // Phase 3: Staggered Typography & UI Release (1.3s - 2.2s)
    revealTl.to('.site-nav', {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out'
    }, '-=0.65');

    revealTl.to('.hero-title-line', {
      y: '0%',
      opacity: 1,
      stagger: 0.1,
      duration: 1.1,
      ease: 'power3.out'
    }, '-=0.7');

    revealTl.to(['.hero-badge', '.hero-tagline', '.hero-scroll-prompt'], {
      y: 0,
      opacity: 1,
      stagger: 0.08,
      duration: 0.85,
      ease: 'power3.out'
    }, '-=0.6');
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
