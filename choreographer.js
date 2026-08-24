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
   * Zen Leaf & Dual Water Ripples Opening Reveal
   * 1. Leaf Falls & Sways (0.0s - 0.5s)
   * 2. Leaf Hits Water -> 1st Concentric Ripples + "Louis." Emerges from water (0.5s - 1.1s)
   * 3. Leaf Sinks into Depth (1.1s - 1.4s)
   * 4. 2nd Full-Screen Shockwave Ripple Sweeps & Reveals Homepage (1.4s - 2.0s)
   */
  playOpeningReveal(zenAnimator = null) {
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

    // Initial Elements Setup
    gsap.set('.hero-title-line', { y: '105%', opacity: 0 });
    gsap.set(['.hero-badge', '.hero-tagline', '.hero-scroll-prompt', '.site-nav'], { y: 24, opacity: 0 });
    
    // Leaf starts above the viewport with a gentle 3D tilt
    gsap.set('.zen-leaf-wrap', {
      y: -window.innerHeight * 0.6,
      x: -40,
      rotation: -35,
      scale: 1.4,
      opacity: 0
    });
    gsap.set('.zen-brand-emerge', {
      scale: 0.85,
      y: 20,
      opacity: 0
    });

    const revealTl = gsap.timeline({
      onComplete: () => {
        if (zenAnimator) zenAnimator.destroy();
        const curtain = document.getElementById('zen-leaf-curtain');
        if (curtain) curtain.remove();
        this.initLenis();
        this.initScrollAnimations();
        this.onRevealComplete();
      }
    });

    // 1. (0.0s - 0.55s) Leaf Falls & Sways to the Water Center
    revealTl.to('.zen-leaf-wrap', {
      y: 0,
      x: 0,
      rotation: 8,
      scale: 1.0,
      opacity: 1,
      duration: 0.55,
      ease: 'power2.in'
    });

    // 2. (0.55s - 1.1s) Touch Water -> Generates 1st Ripples + "Louis." Emerges
    const waveObj1 = { p: 0 };
    revealTl.to(waveObj1, {
      p: 1,
      duration: 0.65,
      ease: 'power1.out',
      onUpdate: () => {
        if (zenAnimator) {
          zenAnimator.touchRippleProgress = waveObj1.p;
          zenAnimator.render();
        }
      }
    }, '-=0.05');

    revealTl.to('.zen-brand-emerge', {
      opacity: 1,
      scale: 1,
      y: -50, // Float slightly above center
      duration: 0.55,
      ease: 'power2.out'
    }, '-=0.55');

    // 3. (1.1s - 1.4s) Leaf Sinks & Dissolves into Deep Water
    revealTl.to('.zen-leaf-wrap', {
      scale: 0.3,
      opacity: 0,
      rotation: 45,
      duration: 0.4,
      ease: 'power2.in'
    }, '+=0.1');

    // 4. (1.35s - 2.0s) 2nd Deep Full-Screen Shockwave Ripple Sweeps & Opens Screen
    const waveObj2 = { p: 0 };
    revealTl.to(waveObj2, {
      p: 1,
      duration: 0.75,
      ease: 'power2.out',
      onUpdate: () => {
        if (zenAnimator) {
          zenAnimator.shockwaveProgress = waveObj2.p;
          zenAnimator.render();
        }
      }
    }, '-=0.15');

    // Curtain and water title dissolve as wave sweeps outward
    revealTl.to('.zen-brand-emerge', {
      opacity: 0,
      scale: 1.15,
      duration: 0.45,
      ease: 'power2.out'
    }, '<');

    revealTl.to('#zen-leaf-curtain', {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.35');

    // 5. Homepage Typography & Navigation Take Over Smoothly
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
