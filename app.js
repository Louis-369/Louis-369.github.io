/**
 * app.js - Main Application Orchestrator
 * 
 * Sets up the editorial page, renders Monolog-style paper-cut cards,
 * initializes magnetic cursor, and triggers s0 reveal rhythm.
 */

import { siteConfig, featuredProjects } from './data/projects.js';
import { Choreographer } from './choreographer.js';
import { WebGLFluidWaterAnimation } from './globe.js';

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

    // Run opening reveal
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      this.choreographer.playOpeningReveal(this.waterAnimator);
    } else {
      window.addEventListener('DOMContentLoaded', () => {
        this.choreographer.playOpeningReveal(this.waterAnimator);
      });
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
                <p class="works-project-desc">${project.description}</p>
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

    // 2. Smooth navigation anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl && this.choreographer && this.choreographer.lenis) {
            e.preventDefault();
            this.choreographer.lenis.scrollTo(targetEl, { offset: -60, duration: 1.4 });
          }
        }
      });
    });

    // 3. 1:1 bymonolog.com "Still waiting..." Tab Visibility Typewriter Marquee
    this.initVisibilityTitleMarquee();
  }

  initVisibilityTitleMarquee() {
    const originalTitle = document.title || "Louis · Creative Developer & Builder";
    let typeTimeout = null;
    const targetPhrase = "Still waiting...";

    const startTyping = () => {
      let charIdx = 0;
      let isDeleting = false;
      let pauseCount = 0;

      const typeStep = () => {
        if (!document.hidden) return;

        if (!isDeleting) {
          charIdx++;
          document.title = targetPhrase.slice(0, charIdx);
          
          if (charIdx === targetPhrase.length) {
            // Full phrase typed, hold for 1.8s
            isDeleting = true;
            typeTimeout = setTimeout(typeStep, 1800);
            return;
          }
          // Typewriter speed: dots type slightly slower for rhythmic anticipation
          const speed = charIdx > 13 ? 400 : 130;
          typeTimeout = setTimeout(typeStep, speed);
        } else {
          // Subtle delete back to "Still waiting" and re-type dots
          charIdx--;
          document.title = targetPhrase.slice(0, charIdx);
          
          if (charIdx === 13) { // Back to "Still waiting"
            isDeleting = false;
            typeTimeout = setTimeout(typeStep, 600);
            return;
          }
          typeTimeout = setTimeout(typeStep, 70);
        }
      };

      typeStep();
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (typeTimeout) clearTimeout(typeTimeout);
        startTyping();
      } else {
        if (typeTimeout) {
          clearTimeout(typeTimeout);
          typeTimeout = null;
        }
        document.title = originalTitle;
      }
    });
  }
}

// Instantiate
new Application();
