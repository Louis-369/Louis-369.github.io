/**
 * app.js - Main Application Orchestrator & Event Bus
 * 
 * Deep module that coordinates:
 * - Data Manifest (projects.js)
 * - 3D Point-Cloud Globe (globe.js)
 * - GSAP Dynamic Choreography (choreographer.js)
 * - Mobile Touch-Swipe Carousel & Keyboard Accessibility
 */

import { siteConfig, sectors } from './data/projects.js';
import { PlanetGlobe } from './globe.js';
import { SceneChoreographer } from './choreographer.js';

class App {
  constructor() {
    this.sectors = sectors;
    this.currentSectorIndex = -1;
    this.isMobile = window.innerWidth <= 768;

    this.canvas = document.getElementById('globe-canvas');
    this.coordsDisplay = document.getElementById('live-coords');
    this.landingContainer = document.getElementById('landing-layer');
    this.sectorContainer = document.getElementById('sector-layer');
    this.navContainer = document.getElementById('sector-nav');
    this.logoAnchor = document.getElementById('logo-anchor');
    this.topbar = document.getElementById('ambient-topbar');
    this.coordsWidget = document.getElementById('ambient-coords');

    this.globe = null;
    this.choreographer = null;

    this.init();
  }

  init() {
    // 1. Build Sector Navigation Tabs
    this.renderNavAnchors();

    // 2. Initialize 3D Globe
    this.globe = new PlanetGlobe(this.canvas, {
      sectors: this.sectors,
      onCoordinateUpdate: (coordText) => {
        if (this.coordsDisplay) {
          this.coordsDisplay.textContent = coordText;
        }
      }
    });

    // 3. Initialize GSAP Choreographer
    const navButtons = document.querySelectorAll('.sector-anchor');
    this.choreographer = new SceneChoreographer({
      canvas: this.canvas,
      landingContainer: this.landingContainer,
      sectorContainer: this.sectorContainer,
      ambientNav: this.navContainer,
      navButtons: navButtons,
      topbar: this.topbar,
      coordsWidget: this.coordsWidget
    });

    // 4. Bind Global Event Handlers
    this.bindEvents();

    // 5. Mobile Swipe Carousel Setup
    this.setupMobileSwipe();

    // 6. Play Landing Entrance
    setTimeout(() => {
      this.choreographer.playLandingEntry();
    }, 150);
  }

  renderNavAnchors() {
    this.navContainer.innerHTML = '';
    this.sectors.forEach((sector, idx) => {
      const btn = document.createElement('button');
      btn.className = 'sector-anchor';
      btn.dataset.sector = sector.id;
      btn.innerHTML = `
        <span class="sector-index">0${idx + 1}</span>
        <span class="sector-text">${sector.label}</span>
      `;
      btn.addEventListener('click', () => {
        this.selectSector(idx);
      });
      this.navContainer.appendChild(btn);
    });
  }

  renderSectorContent(sector) {
    const projectsHtml = sector.projects.map(p => `
      <a href="${p.url}" ${p.isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''} class="project-card">
        <div class="card-header">
          <div class="card-icon-box">${p.icon}</div>
          <div class="card-meta">
            <span class="card-status-dot"></span>
            <span class="card-status-text">${p.status}</span>
          </div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${p.title}</h3>
          <p class="card-subtitle">${p.subtitle}</p>
          <p class="card-desc">${p.desc}</p>
        </div>
        <div class="card-footer">
          <div class="card-tags">
            ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          <div class="card-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </div>
        </div>
      </a>
    `).join('');

    this.sectorContainer.innerHTML = `
      <div class="sector-inner">
        <button class="back-anchor" id="back-to-landing">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>返回星球視野 (Overview)</span>
        </button>

        <div class="sector-header">
          <div class="sector-badge">
            <span class="badge-dot"></span>
            <span>${sector.coordinateCode}</span>
          </div>
          <h2 class="sector-title">${sector.label}</h2>
          <p class="sector-english">${sector.englishLabel}</p>
          <p class="sector-tagline">${sector.tagline}</p>
        </div>

        <div class="projects-grid">
          ${projectsHtml}
        </div>
      </div>
    `;

    // Bind back button
    const backBtn = this.sectorContainer.querySelector('#back-to-landing');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.deselectSector());
    }
  }

  selectSector(index) {
    if (index < 0 || index >= this.sectors.length) return;
    this.currentSectorIndex = index;
    const sector = this.sectors[index];

    this.renderSectorContent(sector);
    this.choreographer.activateSector(sector, this.globe);
  }

  deselectSector() {
    this.currentSectorIndex = -1;
    this.choreographer.deactivateSector(this.globe);
  }

  bindEvents() {
    // Return to landing when clicking top-left Monogram logo
    if (this.logoAnchor) {
      this.logoAnchor.addEventListener('click', (e) => {
        e.preventDefault();
        this.deselectSector();
      });
    }

    // Keyboard Navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.deselectSector();
      } else if (e.key === 'ArrowRight') {
        const next = (this.currentSectorIndex + 1) % this.sectors.length;
        this.selectSector(next);
      } else if (e.key === 'ArrowLeft') {
        const prev = (this.currentSectorIndex - 1 + this.sectors.length) % this.sectors.length;
        this.selectSector(prev);
      }
    });

    // Window Resize
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });
  }

  setupMobileSwipe() {
    let startX = 0;
    let startY = 0;
    let isSwiping = false;

    window.addEventListener('touchstart', (e) => {
      if (!this.isMobile) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwiping = true;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (!this.isMobile || !isSwiping) return;
      isSwiping = false;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = endY - startY;

      // Ensure horizontal swipe
      if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
        if (diffX < 0) {
          // Swipe Left -> Next Sector
          const next = (this.currentSectorIndex + 1) % this.sectors.length;
          this.selectSector(next);
        } else {
          // Swipe Right -> Previous Sector
          const prev = this.currentSectorIndex <= 0 ? this.sectors.length - 1 : this.currentSectorIndex - 1;
          this.selectSector(prev);
        }
      }
    }, { passive: true });
  }
}

// Instantiate on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
