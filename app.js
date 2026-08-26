/**
 * app.js - Main Application Orchestrator
 * 
 * Sets up the editorial page, renders Monolog-style paper-cut cards,
 * initializes magnetic cursor, and triggers s0 reveal rhythm.
 */

import { siteConfig, featuredProjects, aboutStories, capabilities } from './data/projects.js?v=20260826_13';
import { Choreographer } from './choreographer.js?v=20260826_13';
import { WebGLFluidWaterAnimation } from './globe.js?v=20260826_13';
import { MatrixEngine } from './matrix.js?v=20260826_13';

class Application {
  constructor() {
    this.projects = featuredProjects;
    this.stories = aboutStories;
    this.capabilities = capabilities;
    this.choreographer = null;
    this.waterAnimator = null;
    this.matrixEngine = null;
    
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

    // 2. Render dynamic 1:1 Monolog About Stories & Capabilities
    this.renderAboutStories();
    this.renderCapabilities();

    // 3. Initialize WebGL Physical Water Fluid Ripple Simulation
    this.waterAnimator = new WebGLFluidWaterAnimation('water-fluid-canvas');

    // 4. Initialize Full-Screen Matrix Digital Rain Engine
    this.matrixEngine = new MatrixEngine();

    // Pause WebGL fluid simulation when hero is out of view (saves ~30-50MB GPU and CPU rAF)
    const heroEl = document.getElementById('hero');
    if (heroEl && 'IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (this.waterAnimator) {
            if (entry.isIntersecting) {
              this.waterAnimator.resume();
            } else {
              this.waterAnimator.pause();
            }
          }
        });
      }, { threshold: 0.05 });
      heroObserver.observe(heroEl);
    }

    // 4. Initialize Choreographer & play opening reveal (3D Leaf Fall -> WebGL Ripples -> Sinks -> Shockwave)
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

    // 5. Global interaction bindings
    this.bindInteractions();
  }

  renderProjects() {
    const container = document.getElementById('works-cards-container');
    if (!container) return;

    container.innerHTML = this.projects.map((project, idx) => {
      const isExternal = project.isExternal;
      const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
      const indexFormatted = String(idx + 1).padStart(2, '0');
      const totalFormatted = String(this.projects.length).padStart(2, '0');

      return `
        <div class="works-home-item" data-project-index="${idx}">
          <a href="${project.url || '#'}" class="works-home-link" ${targetAttr}>
            <!-- Left: Visual Column (Cols 1-7, 58%) -->
            <div class="works-visual-column">
              <div class="works-image-mask">
                ${project.image 
                  ? `<img src="${project.image}" alt="${project.title}" class="works-home-image" loading="lazy" />`
                  : `<div class="works-placeholder-visual">
                       <span class="placeholder-text">${project.title}</span>
                     </div>`
                }
              </div>
            </div>

            <!-- Right: Content Column (Cols 8-12, 42%) -->
            <div class="works-content-column">
              <div class="works-content-header">
                <div class="works-meta-stamp">
                  <span class="meta-index-pill">SS / ${indexFormatted}/${totalFormatted}</span>
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

  renderAboutStories() {
    const container = document.getElementById('about-stories-track');
    const counterEl = document.getElementById('ethos-counter');
    const progressBar = document.getElementById('ethos-progress-bar');
    if (!container) return;

    container.innerHTML = this.stories.map((story, idx) => `
      <div class="ethos-story-slide ${idx === 0 ? 'active' : ''}" data-slide="${idx}">
        <blockquote class="about-lead-quote">
          "${story.quote}"
        </blockquote>
        <p class="about-body-text">
          ${story.body}
        </p>
      </div>
    `).join('');

    const total = this.stories.length;
    if (counterEl) counterEl.textContent = `01/0${total}`;
    if (progressBar) {
      progressBar.style.width = `${100 / total}%`;
      progressBar.style.transform = `translateX(0%)`;
    }
  }

  renderCapabilities() {
    const list = document.getElementById('about-capabilities-list');
    if (!list) return;

    list.innerHTML = this.capabilities.map((cap, idx) => `
      <li class="capability-item ${idx === 0 ? 'active' : ''}">
        <span class="capability-name">${cap}</span>
      </li>
    `).join('');
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

    // 2. Smooth internal page scrolling (#works, #about, etc.)
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl && this.choreographer && this.choreographer.lenis) {
            e.preventDefault();
            this.choreographer.lenis.scrollTo(targetEl, { offset: 0, duration: 1.4 });
          }
        }
      });
    });

    // 3. 1:1 bymonolog.com Interactive Capabilities Stack Hover
    const capList = document.getElementById('about-capabilities-list');
    if (capList) {
      capList.addEventListener('mouseover', (e) => {
        const item = e.target.closest('.capability-item');
        if (item) {
          document.querySelectorAll('.capability-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
        }
      });
    }

    // 4. 1:1 bymonolog.com Left Ethos Story Slider
    this.initEthosSlider();

    // 5. Psychic Silver Spoon Easter Egg
    this.initSpoonEasterEgg();
  }

  initSpoonEasterEgg() {
    const spoonTrigger = document.getElementById('footer-spoon-trigger');
    const spoonHandle = document.getElementById('spoon-handle-path');
    const spoonSvg = document.getElementById('spoon-svg-elem');
    if (!spoonTrigger || !spoonHandle || !spoonSvg) return;

    let isBending = false;

    // Hover dynamic psychic bending based on mouse pointer
    spoonTrigger.addEventListener('mousemove', (e) => {
      if (isBending) return;
      const rect = spoonTrigger.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const bend = relX * 22; // Handle deflection
      
      if (window.gsap) {
        window.gsap.to(spoonHandle, {
          attr: { d: `M 20 18.8 Q ${20 + bend} 26.5 20 34` },
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        window.gsap.to(spoonSvg, {
          rotation: relX * 20,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    });

    spoonTrigger.addEventListener('mouseleave', () => {
      if (isBending) return;
      if (window.gsap) {
        window.gsap.to(spoonHandle, {
          attr: { d: 'M 20 18.8 Q 20 26.5 20 34' },
          duration: 0.75,
          ease: 'elastic.out(1.2, 0.4)',
          overwrite: 'auto'
        });
        window.gsap.to(spoonSvg, {
          rotation: 0,
          duration: 0.75,
          ease: 'elastic.out(1.2, 0.4)',
          overwrite: 'auto'
        });
      }
    });

    // Click: violent bend -> electric flash -> open Matrix Digital Rain
    const triggerMatrix = () => {
      if (isBending) return;
      isBending = true;

      if (window.gsap) {
        const tl = window.gsap.timeline({
          onComplete: () => {
            isBending = false;
            // Reset spoon state
            window.gsap.set(spoonHandle, { attr: { d: 'M 20 18.8 Q 20 26.5 20 34' } });
            window.gsap.set(spoonSvg, { rotation: 0, scale: 1, opacity: 1 });
            // Open matrix
            if (this.matrixEngine) {
              this.matrixEngine.open();
            }
          }
        });

        // 1. Extreme psychic 90-degree kink
        tl.to(spoonHandle, {
          attr: { d: 'M 20 18.8 Q 42 22 20 34' },
          duration: 0.22,
          ease: 'power4.in'
        });
        tl.to(spoonSvg, {
          rotation: 45,
          scale: 1.25,
          duration: 0.22,
          ease: 'power4.in'
        }, '<');

        // 2. Electric glitch
        tl.to(spoonSvg, {
          opacity: 0.3,
          duration: 0.08,
          repeat: 3,
          yoyo: true
        });

        // 3. Dissolve into the matrix void
        tl.to(spoonSvg, {
          scale: 0,
          opacity: 0,
          duration: 0.22,
          ease: 'power2.in'
        });
      } else {
        if (this.matrixEngine) {
          this.matrixEngine.open();
        }
      }
    };

    spoonTrigger.addEventListener('click', triggerMatrix);
    spoonTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerMatrix();
      }
    });
  }

  initEthosSlider() {
    const prevBtn = document.getElementById('ethos-prev-btn');
    const nextBtn = document.getElementById('ethos-next-btn');
    const counterEl = document.getElementById('ethos-counter');
    const progressBar = document.getElementById('ethos-progress-bar');
    const tagEl = document.getElementById('ethos-current-tag');
    if (!prevBtn || !nextBtn) return;

    let currentSlide = 0;

    const updateSlide = (newIndex) => {
      const slides = document.querySelectorAll('.ethos-story-slide');
      const totalSlides = this.stories.length;
      if (!slides.length || totalSlides === 0) return;

      slides[currentSlide].classList.remove('active');
      currentSlide = (newIndex + totalSlides) % totalSlides;
      slides[currentSlide].classList.add('active');

      if (counterEl) {
        counterEl.textContent = `0${currentSlide + 1}/0${totalSlides}`;
      }
      if (progressBar) {
        progressBar.style.transform = `translateX(${currentSlide * 100}%)`;
      }
      if (tagEl && this.stories[currentSlide] && this.stories[currentSlide].tag) {
        tagEl.textContent = this.stories[currentSlide].tag;
      }
    };

    prevBtn.onclick = () => updateSlide(currentSlide - 1);
    nextBtn.onclick = () => updateSlide(currentSlide + 1);
  }
}

// Instantiate
new Application();
