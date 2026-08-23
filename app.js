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
    this.cursor = {
      el: null,
      dot: null,
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0
    };
    
    this.init();
  }

  init() {
    // 1. Render dynamic projects list (bymonolog paper-cut cards)
    this.renderProjects();
    
    // 2. Setup magnetic custom cursor (desktop only)
    this.initCustomCursor();

    // 3. Initialize background particles
    this.ambientParticles = new AmbientParticles('ambient-canvas');

    // 4. Initialize Choreographer & play opening reveal (s0 rhythm)
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

    // 5. Global interaction bindings
    this.bindInteractions();
  }

  renderProjects() {
    const container = document.getElementById('works-cards-container');
    if (!container) return;

    container.innerHTML = this.projects.map((project, idx) => {
      const isExternal = project.isExternal;
      const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
      const isWip = project.tags.includes('WIP');

      return `
        <article class="paper-stack-card" data-card-index="${idx}">
          <div class="card-frame-inner">
            <div class="card-paper-header">
              <div class="card-header-badge-group">
                <span class="card-pill-badge">${project.coverBadge}</span>
                <span class="card-pill-category">${project.category}</span>
              </div>
              <span class="card-year-stamp">${project.year}</span>
            </div>

            <div class="card-grid-split">
              <!-- Left: Paper-Cut Window Portal -->
              <div class="card-portal-window">
                <div class="card-portal-frame">
                  <div class="card-portal-media" style="background: ${project.colorScheme.bgSubtle};">
                    <div class="portal-visual-mockup">
                      <div class="mockup-header">
                        <span class="mockup-dot"></span>
                        <span class="mockup-dot"></span>
                        <span class="mockup-dot"></span>
                        <span class="mockup-title">${project.title.toLowerCase()}.io</span>
                      </div>
                      <div class="mockup-canvas-content">
                        <div class="mockup-center-symbol" style="color: ${project.colorScheme.accent};">
                          ${idx === 0 ? '🧠' : idx === 1 ? '🎬' : idx === 2 ? '⚡' : '🚧'}
                        </div>
                        <span class="mockup-title-text">${project.title}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: Editorial Content Details -->
              <div class="card-editorial-body">
                <div class="card-editorial-meta">
                  <h3 class="card-project-title">${project.title}</h3>
                  <p class="card-project-summary">${project.summary}</p>
                </div>

                <p class="card-project-description">${project.desc}</p>

                <!-- Key Metrics -->
                <div class="card-metrics-grid">
                  ${project.metrics.map(m => `
                    <div class="metric-item">
                      <span class="metric-value">${m.value}</span>
                      <span class="metric-label">${m.label}</span>
                    </div>
                  `).join('')}
                </div>

                <!-- Tags & CTA Action -->
                <div class="card-action-row">
                  <div class="card-tags-list">
                    ${project.tags.map(t => `<span class="paper-tag">${t}</span>`).join('')}
                  </div>
                  
                  <a href="${project.url}" ${targetAttr} class="card-open-link ${isWip ? 'is-disabled' : ''}" data-cursor-text="OPEN">
                    <span>${isWip ? 'IN PROGRESS' : 'EXPLORE'}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  initCustomCursor() {
    if (window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches) {
      return; // Disable on touch/mobile
    }

    const cursor = document.getElementById('custom-cursor');
    const cursorText = document.getElementById('cursor-text');
    if (!cursor) return;

    window.addEventListener('mousemove', (e) => {
      this.cursor.targetX = e.clientX;
      this.cursor.targetY = e.clientY;
    });

    const updateCursor = () => {
      this.cursor.x += (this.cursor.targetX - this.cursor.x) * 0.18;
      this.cursor.y += (this.cursor.targetY - this.cursor.y) * 0.18;

      cursor.style.transform = `translate3d(${this.cursor.x}px, ${this.cursor.y}px, 0)`;
      requestAnimationFrame(updateCursor);
    };
    requestAnimationFrame(updateCursor);

    // Magnetic and expansion hover handlers
    document.querySelectorAll('a, button, [data-cursor-text]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-hovering');
        const customText = el.getAttribute('data-cursor-text');
        if (customText && cursorText) {
          cursorText.textContent = customText;
          cursor.classList.add('has-text');
        }
      });

      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-hovering', 'has-text');
        if (cursorText) cursorText.textContent = '';
      });
    });
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
