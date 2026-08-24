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
   * Minimalist Bauhaus Metal Dip Pen & Navier-Stokes Fluid Opening Reveal (6.8s Epic Sequence)
   * 1. Craft Pen descends smoothly from top-right with gilded metallic sheen & shadow convergence (0.0s - 1.8s)
   * 2. Pen Nib "Dips" Water Center -> Drops concentrated Prussian Ink -> Generates Wide Slow Fluid Waves (1.8s - 3.8s)
   * 3. Water-Emerging Brand "Louis." glows with fluid light refraction (2.2s - 4.4s)
   * 4. Pen retracts smoothly upwards -> 2nd Deep Heavy Water Swell Sweeps Full-Screen (3.8s - 5.4s)
   * 5. Deep Obsidian-Prussian Fluid melts like morning mist into clean Ivory Homepage (5.4s - 6.8s)
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

    // Initial Elements Setup
    gsap.set('.hero-title-line', { y: '105%', opacity: 0 });
    gsap.set(['.hero-badge', '.hero-tagline', '.hero-scroll-prompt', '.site-nav'], { y: 24, opacity: 0 });
    
    // Bauhaus Craft Pen starting state: Poised in the air at top-right
    gsap.set('.craft-pen-wrap', {
      y: -window.innerHeight * 0.5,
      x: 80,
      rotation: 25,
      scale: 1.2,
      opacity: 0
    });
    gsap.set('.craft-pen-shadow', {
      scale: 0.1,
      opacity: 0,
      y: 50
    });
    gsap.set('.zen-brand-emerge', {
      scale: 0.85,
      y: 30,
      opacity: 0
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

    // 1. (0.0s - 1.8s) Craft Pen descends with smooth mechanical elegance
    revealTl.to('.craft-pen-wrap', {
      y: 0,
      x: 0,
      rotation: 12,
      scale: 1.0,
      opacity: 1,
      duration: 1.8,
      ease: 'power3.out'
    });

    revealTl.to('.craft-pen-shadow', {
      scale: 1.0,
      opacity: 0.95,
      y: 0,
      duration: 1.8,
      ease: 'power3.out'
    }, '<');

    // 2. (1.8s - 3.8s) Pen Nib "Dips" Water Center -> Ink Drops & Fluid Dispersion
    // Quick gentle dip downwards and slight bounce
    revealTl.to('.craft-pen-wrap', {
      y: 8,
      duration: 0.35,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1
    });

    const rippleObj1 = { p: 0 };
    revealTl.to(rippleObj1, {
      p: 1,
      duration: 2.2,
      ease: 'power1.out',
      onUpdate: () => {
        if (waterAnimator) {
          waterAnimator.splatIntensity = rippleObj1.p;
        }
      }
    }, '-=0.3');

    // Brand "Louis." surfaces from the deep Prussian ink pool
    revealTl.to('.zen-brand-emerge', {
      opacity: 1,
      scale: 1,
      y: -90,
      duration: 1.4,
      ease: 'power2.out'
    }, '-=1.8');

    // 3. (3.6s - 4.8s) Pen gracefully retracts upwards into the air
    revealTl.to('.craft-pen-wrap', {
      y: -window.innerHeight * 0.6,
      x: 60,
      rotation: 30,
      opacity: 0,
      duration: 1.5,
      ease: 'power2.in'
    }, '+=0.2');

    revealTl.to('.craft-pen-shadow', {
      scale: 0.1,
      opacity: 0,
      duration: 1.2,
      ease: 'power2.in'
    }, '<');

    // 4. (4.2s - 5.8s) 2nd Heavy Deep Ocean Surge Swell Sweeps Full Screen
    const rippleObj2 = { p: 0 };
    revealTl.to(rippleObj2, {
      p: 1,
      duration: 2.0,
      ease: 'power2.out',
      onUpdate: () => {
        if (waterAnimator) {
          waterAnimator.surgeIntensity = rippleObj2.p;
        }
      }
    }, '-=1.0');

    // Brand dissolves into water light
    revealTl.to('.zen-brand-emerge', {
      opacity: 0,
      scale: 1.15,
      duration: 0.9,
      ease: 'power2.out'
    }, '-=1.2');

    // 5. (5.2s - 6.8s) Deep Obsidian Curtain dissolves like silk into Ivory Canvas
    revealTl.to('#zen-leaf-curtain', {
      opacity: 0,
      duration: 1.4,
      ease: 'power2.inOut'
    }, '-=0.8');

    // Homepage Typography & Navigation Take Over with Pure Grace
    revealTl.to('.site-nav', {
      y: 0,
      opacity: 1,
      duration: 1.1,
      ease: 'power3.out'
    }, '-=0.7');

    revealTl.to('.hero-title-line', {
      y: '0%',
      opacity: 1,
      stagger: 0.12,
      duration: 1.3,
      ease: 'power3.out'
    }, '-=0.9');

    revealTl.to(['.hero-badge', '.hero-tagline', '.hero-scroll-prompt'], {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 1.0,
      ease: 'power3.out'
    }, '-=0.8');
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
