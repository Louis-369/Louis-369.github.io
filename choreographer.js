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
   * Realistic 3D Leaf Fall & WebGL Fluid Water Surface Opening Reveal (Navier-Stokes Stable Fluids)
   * 1. 3D Leaf Falls gently with realistic aerodynamic sway & shadow convergence (0.0s - 1.0s)
   * 2. Leaf Hits Water Surface -> Generates Navier-Stokes Fluid Dispersion + "Louis." text emerges (1.0s - 2.0s)
   * 3. Leaf Sinks into deep fluid with viscosity refraction (2.0s - 2.8s)
   * 4. 2nd Deep Fluid Surge Sweeps Full-Screen -> dissolves curtain & reveals homepage (2.8s - 3.8s)
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
    
    // 3D Leaf starting state: High in the air with strong 3D rotation & floating shadow
    gsap.set('.zen-leaf-3d-wrap', {
      y: -window.innerHeight * 0.7,
      x: -60,
      rotationX: 55,
      rotationY: -35,
      rotationZ: -30,
      scale: 1.8,
      opacity: 0
    });
    gsap.set('.leaf-3d-shadow', {
      scale: 0.15,
      opacity: 0,
      y: 60
    });
    gsap.set('.zen-brand-emerge', {
      scale: 0.85,
      y: 20,
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

    // 1. (0.0s - 1.0s) Gentle, Poetic 3D Leaf Floating Descent
    revealTl.to('.zen-leaf-3d-wrap', {
      y: 0,
      x: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 14,
      scale: 1.0,
      opacity: 1,
      duration: 1.05,
      ease: 'power2.out'
    });

    revealTl.to('.leaf-3d-shadow', {
      scale: 1.0,
      opacity: 0.9,
      y: 0,
      duration: 1.05,
      ease: 'power2.out'
    }, '<');

    // 2. (1.0s - 2.1s) Leaf Touches Fluid Surface -> Navier-Stokes Fluid Dispersion
    const rippleObj1 = { p: 0 };
    revealTl.to(rippleObj1, {
      p: 1,
      duration: 1.2,
      ease: 'power1.out',
      onUpdate: () => {
        if (waterAnimator) {
          waterAnimator.splatIntensity = rippleObj1.p;
        }
      }
    }, '-=0.1');

    // Water Emerging Brand Text Distortion & Reveal
    revealTl.to('.zen-brand-emerge', {
      opacity: 1,
      scale: 1,
      y: -65,
      duration: 0.9,
      ease: 'power2.out'
    }, '-=1.0');

    // 3. (2.0s - 2.7s) Leaf Sinks Slowly into Deep Fluid
    revealTl.to('.zen-leaf-3d-wrap', {
      scale: 0.2,
      opacity: 0,
      rotationZ: 65,
      y: 40,
      duration: 0.7,
      ease: 'power2.inOut'
    }, '+=0.2');

    revealTl.to('.leaf-3d-shadow', {
      scale: 0.1,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.inOut'
    }, '<');

    // 4. (2.6s - 3.8s) 2nd Full-Screen Navier-Stokes Surge Sweeps Screen
    const rippleObj2 = { p: 0 };
    revealTl.to(rippleObj2, {
      p: 1,
      duration: 1.3,
      ease: 'power2.out',
      onUpdate: () => {
        if (waterAnimator) {
          waterAnimator.surgeIntensity = rippleObj2.p;
        }
      }
    }, '-=0.2');

    // Smooth Curtain & Brand Transition
    revealTl.to('.zen-brand-emerge', {
      opacity: 0,
      scale: 1.15,
      duration: 0.7,
      ease: 'power2.out'
    }, '<');

    revealTl.to('#zen-leaf-curtain', {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.5');

    // 5. Clean Editorial Homepage Release
    revealTl.to('.site-nav', {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out'
    }, '-=0.4');

    revealTl.to('.hero-title-line', {
      y: '0%',
      opacity: 1,
      stagger: 0.1,
      duration: 1.1,
      ease: 'power3.out'
    }, '-=0.6');

    revealTl.to(['.hero-badge', '.hero-tagline', '.hero-scroll-prompt'], {
      y: 0,
      opacity: 1,
      stagger: 0.08,
      duration: 0.85,
      ease: 'power3.out'
    }, '-=0.5');
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
