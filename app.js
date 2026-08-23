/**
 * app.js - Main Application Orchestrator
 * 
 * Sets up the editorial page, renders Monolog-style paper-cut cards,
 * initializes magnetic cursor, and triggers s0 reveal rhythm.
 */

import { siteConfig, featuredProjects } from './data/projects.js';
import { Choreographer } from './choreographer.js';
import { AmbientParticles } from './globe.js';

class Application {
  constructor() {
    this.projects = featuredProjects;
    this.choreographer = null;
    this.ambientParticles = null;
    
    this.init();
  }

  init() {
    // 1. Render dynamic projects list (bymonolog paper-cut cards)
    this.renderProjects();

    // 2. Initialize background particles
    this.ambientParticles = new AmbientParticles('ambient-canvas');

    // 3. Initialize Choreographer & play opening reveal (s0 rhythm)
    this.choreographer = new Choreographer({
      onRevealComplete: () => {
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-revealed');
      }
    });

    // Run opening reveal
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      this.choreographer.playOpeningReveal();
    } else {
      window.addEventListener('DOMContentLoaded', () => {
        this.choreographer.playOpeningReveal();
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
          <a href="${project.url}" ${targetAttr} class="works-home-link ${isWip ? 'is-disabled' : ''}">
            <!-- Left: Open Architecture Visual Window (Columns 1-7) -->
            <div class="works-visual-column">
              <div class="works-image-mask">
                ${project.image ? `
                  <img src="${project.image}" alt="${project.title}" class="works-home-image" loading="lazy" />
                ` : `
                  <div class="works-placeholder-visual" style="background: ${project.colorScheme.bgSubtle};">
                    <span class="placeholder-icon" style="color: ${project.colorScheme.accent};">🚧</span>
                    <span class="placeholder-text">${project.title}</span>
                  </div>
                `}
              </div>
            </div>

            <!-- Right: Open Editorial Content Details (Columns 8-12) -->
            <div class="works-content-column">
              <div class="works-content-header">
                <div class="works-meta-stamp">
                  <span class="meta-brand-prefix">SS</span>
                  <span class="meta-index-pill">${indexFormatted}/${String(this.projects.length).padStart(2, '0')}</span>
                </div>
                <h3 class="works-project-title">${project.title}</h3>
                <p class="works-project-desc">${project.desc}</p>
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
    // Smooth navigation anchor links
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
  }
}

// Instantiate
new Application();
