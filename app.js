/**
 * app.js - Main Application Orchestrator
 * 
 * Sets up the editorial page, renders Monolog-style paper-cut cards,
 * initializes magnetic cursor, and triggers s0 reveal rhythm.
 */

import { siteConfig, featuredProjects } from './data/projects.js?v=20260825_02';
import { Choreographer } from './choreographer.js?v=20260825_02';
import { WebGLFluidWaterAnimation } from './globe.js?v=20260825_02';

class Application {
  constructor() {
    this.projects = featuredProjects;
    this.choreographer = null;
    this.waterAnimator = null;
    
    this.init();
  }

  init() {
    // 0. Force scroll restoration to top on refresh
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // 1. Render dynamic projects list (bymonolog 12-col open grid)
    this.renderProjects();

    // 2. Initialize WebGL Physical Water Fluid Ripple Simulation
    this.waterAnimator = new WebGLFluidWaterAnimation('water-fluid-canvas');

    // 3. Initialize Choreographer & play opening reveal (3D Leaf Fall -> WebGL Ripples -> Sinks -> Shockwave)
    this.choreographer = new Choreographer({
      onRevealComplete: () => {
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-revealed');
      }
    });

    // Run opening reveal AFTER fonts are fully loaded (ensures stable layout for dot coordinates)
    const startReveal = () => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          this.choreographer.playOpeningReveal(this.waterAnimator);
        });
      } else {
        this.choreographer.playOpeningReveal(this.waterAnimator);
      }
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      startReveal();
    } else {
      window.addEventListener('DOMContentLoaded', startReveal);
    }

    // 4. Global interaction bindings
    this.bindInteractions();
  }

  renderProjects() {
    const container = document.getElementById('works-cards-container');
    if (!container) return;

    container.innerHTML = this.projects.map((project, idx) => {
      const isExternal = project.isExternal;
      const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
      const isWip = project.tags.includes('WIP');
      const indexFormatted = String(idx + 1).padStart(2, '0');

      return `
        <div class="works-home-item" data-project-index="${idx}">
          <a href="${project.liveUrl}" class="works-home-link" ${targetAttr}>
            <!-- Left: Visual Column (Cols 1-7, 58%) -->
            <div class="works-visual-column">
              <div class="works-image-mask">
                ${project.image 
                  ? `<img src="${project.image}" alt="${project.title}" class="works-home-image" loading="lazy" />`
                  : `<div class="works-placeholder-visual">
                       <span class="placeholder-icon">${project.icon}</span>
                       <span class="placeholder-text">${project.title}</span>
                     </div>`
                }
              </div>
            </div>

            <!-- Right: Content Column (Cols 8-12, 42%) -->
            <div class="works-content-column">
              <div class="works-content-header">
                <div class="works-meta-stamp">
                  <span class="meta-index-pill">SS / ${indexFormatted}/04</span>
                  <span>${project.category}</span>
                </div>
                <h3 class="works-project-title">${project.title}</h3>
                <p class="works-project-desc">${project.desc || project.summary}</p>
              </div>

              <!-- Bottom Impact Metric Highlight -->
              <div class="works-result-block">
                <div class="result-number">${project.metrics[0].value}</div>
                <div class="result-label">${project.metrics[0].label} · ${project.summary}</div>
              </div>
            </div>
          </a>
        </div>
      `;
    }).join('');
  }

  bindInteractions() {
    // 1. Logo Click: Smooth Scroll Directly to Top
    const logoBrand = document.getElementById('nav-brand-logo');
    if (logoBrand) {
      logoBrand.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.choreographer && this.choreographer.lenis) {
          this.choreographer.lenis.scrollTo(0, { duration: 1.4 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    // 2. Smooth navigation anchor links & SCROLL DOWN click
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl && this.choreographer && this.choreographer.lenis) {
            e.preventDefault();
            // Scroll precisely to the top of #works so hero & SCROLL DOWN are 100% past the top edge
            this.choreographer.lenis.scrollTo(targetEl, { offset: 0, duration: 1.4 });
          }
        }
      });
    });

    // 3. 1:1 bymonolog.com "Still waiting..." Tab Visibility Typewriter Marquee
    // 4. Global interaction bindings
    this.initMagneticCursor();

    // 5. 1:1 bymonolog.com Interactive Capabilities Stack Hover
    const capItems = document.querySelectorAll('.capability-item');
    capItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        capItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });

    // 6. 1:1 bymonolog.com Left Ethos Story Slider
    this.initEthosSlider();

    // 7. 1:1 Monolog Adaptive Header Dark/Light Theme Switcher
    this.initNavThemeObserver();
  }

  initNavThemeObserver() {
    const nav = document.querySelector('.site-nav');
    const aboutSection = document.getElementById('about');
    if (!nav) return;

    const checkOverlap = () => {
      const navRect = nav.getBoundingClientRect();
      let isOverDark = false;

      if (aboutSection) {
        const aboutRect = aboutSection.getBoundingClientRect();
        // Trigger as soon as header reaches the about section
        if (aboutRect.top <= (navRect.bottom + 10) && aboutRect.bottom >= (navRect.top - 10)) {
          isOverDark = true;
        }
      }

      if (isOverDark) {
        nav.classList.add('is-dark-theme');
      } else {
        nav.classList.remove('is-dark-theme');
      }
    };

    window.addEventListener('scroll', checkOverlap, { passive: true });
    window.addEventListener('resize', checkOverlap, { passive: true });

    // Ensure Lenis smooth scroll updates trigger the theme switch instantly
    const pollLenis = setInterval(() => {
      if (this.choreographer && this.choreographer.lenis) {
        this.choreographer.lenis.on('scroll', checkOverlap);
        clearInterval(pollLenis);
      }
    }, 100);

    // Initial check
    checkOverlap();
  }

  initEthosSlider() {
    const slides = document.querySelectorAll('.ethos-story-slide');
    const prevBtn = document.getElementById('ethos-prev-btn');
    const nextBtn = document.getElementById('ethos-next-btn');
    const counterEl = document.getElementById('ethos-counter');
    const progressBar = document.getElementById('ethos-progress-bar');
    if (!slides.length || !prevBtn || !nextBtn) return;

    let currentSlide = 0;
    const totalSlides = slides.length;

    const updateSlide = (newIndex) => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (newIndex + totalSlides) % totalSlides;
      slides[currentSlide].classList.add('active');

      if (counterEl) {
        counterEl.textContent = `0${currentSlide + 1}/0${totalSlides}`;
      }
      if (progressBar) {
        progressBar.style.transform = `translateX(${currentSlide * 100}%)`;
      }
    };

    prevBtn.addEventListener('click', () => updateSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => updateSlide(currentSlide + 1));
  }
}

// Instantiate
new Application();
