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
   * Cinematic Ink-Stamp Opening Reveal (4-Corner Ink -> Vermilion Seal -> Focal Dot Collapse -> Supernova Expand)
   */
  playOpeningReveal(inkAnimator = null) {
    const gsap = window.gsap;
    if (!gsap) {
      console.warn('GSAP not loaded.');
      return;
    }

    if (this.prefersReducedMotion) {
      const curtain = document.getElementById('ink-opening-curtain');
      if (curtain) curtain.remove();
      gsap.set(['.hero-title-line', '.hero-badge', '.hero-tagline', '.site-nav', '.hero-scroll-prompt'], { opacity: 1, y: 0 });
      this.initLenis();
      this.initScrollAnimations();
      this.onRevealComplete();
      return;
    }

    // Initial Elements Setup
    gsap.set('.hero-title-line', { y: '105%', opacity: 0 });
    gsap.set(['.hero-badge', '.hero-tagline', '.hero-scroll-prompt', '.site-nav'], { y: 24, opacity: 0 });
    gsap.set('.ink-seal-wrapper', { scale: 0.85, opacity: 0 });
    gsap.set('.ink-focal-dot', { scale: 0, opacity: 1 });

    const revealTl = gsap.timeline({
      onComplete: () => {
        if (inkAnimator) inkAnimator.destroy();
        const curtain = document.getElementById('ink-opening-curtain');
        if (curtain) curtain.remove();
        this.initLenis();
        this.initScrollAnimations();
        this.onRevealComplete();
      }
    });

    // 1. (0.0s - 0.6s) 4-Corner Ink Streams Rush to Center
    const inkProgressObj = { p: 0 };
    revealTl.to(inkProgressObj, {
      p: 1,
      duration: 0.65,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (inkAnimator) inkAnimator.render(inkProgressObj.p);
      }
    });

    // 2. (0.6s - 1.1s) Vermilion Seal Stamp Impacts & Forges
    revealTl.to('.ink-seal-wrapper', {
      opacity: 1,
      scale: 1,
      duration: 0.45,
      ease: 'back.out(1.8)'
    }, '-=0.15');

    // 3. (1.1s - 1.4s) Seal Collapses into a Compact Vermilion Focal Dot
    revealTl.to('.ink-seal-wrapper', {
      scale: 0.05,
      opacity: 0,
      duration: 0.35,
      ease: 'power3.in'
    }, '+=0.25');

    revealTl.to('.ink-focal-dot', {
      scale: 1,
      duration: 0.35,
      ease: 'power3.in'
    }, '<');

    // 4. (1.4s - 1.9s) Focal Dot Explosively Expands (Supernova Reveal) & Curtain Dissolves
    revealTl.to('.ink-focal-dot', {
      scale: 180,
      opacity: 0,
      duration: 0.55,
      ease: 'power4.out'
    });

    revealTl.to('#ink-opening-curtain', {
      opacity: 0,
      duration: 0.45,
      ease: 'power2.out'
    }, '-=0.4');

    // 5. Staggered Entrance of Editorial Typography & Navigation
    revealTl.to('.site-nav', {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.35');

    revealTl.to('.hero-title-line', {
      y: '0%',
      opacity: 1,
      stagger: 0.08,
      duration: 1.0,
      ease: 'power3.out'
    }, '-=0.5');

    revealTl.to(['.hero-badge', '.hero-tagline', '.hero-scroll-prompt'], {
      y: 0,
      opacity: 1,
      stagger: 0.06,
      duration: 0.75,
      ease: 'power3.out'
    }, '-=0.45');
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
