/**
 * @file app.js
 * @description Main application orchestrator.
 * Initializes editorial layout, dynamic cards, WebGL fluid engine, and interactive micro-interactions.
 */

import { siteConfig, featuredProjects, aboutStories, capabilities } from './data/projects.js?v=20260829_09';
import { Choreographer } from './choreographer.js?v=20260829_09';
import { WebGLFluidWaterAnimation } from './fluid-engine.js?v=20260829_09';
import { MatrixEngine } from './matrix.js?v=20260829_09';

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

  /**
   * Initializes application components and triggers opening sequence.
   */
  init() {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    this.renderProjects();
    this.renderAboutStories();
    this.renderCapabilities();

    this.waterAnimator = new WebGLFluidWaterAnimation('water-fluid-canvas');
    this.matrixEngine = new MatrixEngine();

    // Viewport observer: pause WebGL fluid simulation when hero is out of view
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

    this.choreographer = new Choreographer({
      onRevealComplete: () => {
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-revealed');
      }
    });

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

    this.bindInteractions();
  }

  /**
   * Renders the featured projects grid.
   */
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

            <div class="works-content-column">
              <div class="works-content-header">
                <div class="works-meta-stamp">
                  <span class="meta-index-pill">SS / ${indexFormatted}/${totalFormatted}</span>
                  <span>${project.category}</span>
                </div>
                <h3 class="works-project-title">${project.title}</h3>
                <p class="works-project-desc">${project.desc || project.summary}</p>
              </div>

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

  /**
   * Wraps text in split masks for typography transition.
   * @param {string} text
   * @param {boolean} [isQuote=false]
   * @returns {string}
   */
  wrapWordsInMasks(text, isQuote = false) {
    const quoteOpen = isQuote ? '<span class="split-word-mask"><span class="split-word-inner">“</span></span>' : '';
    const quoteClose = isQuote ? '<span class="split-word-mask"><span class="split-word-inner">”</span></span>' : '';
    const words = text.split(' ').map(w => `<span class="split-word-mask"><span class="split-word-inner">${w}</span></span>`).join(' ');
    return `${quoteOpen}${words}${quoteClose}`;
  }

  /**
   * Renders the philosophy story slides.
   */
  renderAboutStories() {
    const container = document.getElementById('about-stories-track');
    const counterEl = document.getElementById('ethos-counter');
    if (!container) return;

    container.innerHTML = this.stories.map((story, idx) => `
      <div class="ethos-story-slide ${idx === 0 ? 'active' : ''}" data-slide="${idx}">
        <blockquote class="about-lead-quote">
          ${this.wrapWordsInMasks(story.quote, true)}
        </blockquote>
        <p class="about-body-text">
          ${this.wrapWordsInMasks(story.body, false)}
        </p>
      </div>
    `).join('');

    const total = this.stories.length;
    if (counterEl) counterEl.textContent = `01/0${total}`;
  }

  /**
   * Renders the interactive capabilities stack list and background video canvas.
   */
  renderCapabilities() {
    const list = document.getElementById('about-capabilities-list');
    const videoWrap = document.getElementById('capabilities-video-wrap');
    if (!list) return;

    list.innerHTML = this.capabilities.map((cap, idx) => `
      <li class="capability-item ${idx === 0 ? 'active' : ''}" data-cap-index="${idx}">
        <span class="capability-name">${cap.name}</span>
      </li>
    `).join('');

    if (videoWrap) {
      videoWrap.innerHTML = this.capabilities.map((cap, idx) => `
        <video 
          class="capability-bg-video ${idx === 0 ? 'active' : ''}" 
          data-video-index="${idx}"
          src="${cap.video}" 
          muted 
          loop 
          playsinline 
          preload="auto"
          autoplay
        ></video>
      `).join('');
    }
  }

  /**
   * Binds global navigation and interactive handlers.
   */
  bindInteractions() {
    // 1. Logo brand smooth scroll to top
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

    // 2. Smooth internal anchor navigation
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

    // 3. Capabilities stack hover and dynamic video switching
    const capList = document.getElementById('about-capabilities-list');
    const videoWrap = document.getElementById('capabilities-video-wrap');
    if (capList) {
      const capItems = capList.querySelectorAll('.capability-item');
      const videoItems = videoWrap ? videoWrap.querySelectorAll('.capability-bg-video') : [];

      const switchCapability = (idx) => {
        capItems.forEach((item, i) => {
          if (i === idx) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });

        videoItems.forEach((video, i) => {
          if (i === idx) {
            video.classList.add('active');
            if (video.paused) {
              video.play().catch(() => {});
            }
          } else {
            video.classList.remove('active');
          }
        });
      };

      capList.addEventListener('mouseover', (e) => {
        const item = e.target.closest('.capability-item');
        if (item) {
          const idx = parseInt(item.getAttribute('data-cap-index'), 10);
          if (!isNaN(idx) && !item.classList.contains('active')) {
            switchCapability(idx);
          }
        }
      });
    }

    this.initEthosSlider();
    this.initSpoonEasterEgg();
  }

  /**
   * Initializes psychic silver spoon easter egg with cached rect and Matrix rain trigger.
   */
  initSpoonEasterEgg() {
    const spoonTrigger = document.getElementById('footer-spoon-trigger');
    const spoonHandle = document.getElementById('spoon-handle-path');
    const spoonSvg = document.getElementById('spoon-svg-elem');
    if (!spoonTrigger || !spoonHandle || !spoonSvg) return;

    let isBending = false;
    let triggerRect = null;

    // Cache bounding box on mouseenter to prevent layout thrashing
    spoonTrigger.addEventListener('mouseenter', () => {
      triggerRect = spoonTrigger.getBoundingClientRect();
    });

    spoonTrigger.addEventListener('mousemove', (e) => {
      if (isBending) return;
      if (!triggerRect) triggerRect = spoonTrigger.getBoundingClientRect();
      const relX = (e.clientX - triggerRect.left) / triggerRect.width - 0.5;
      const bend = relX * 26;
      
      if (window.gsap) {
        window.gsap.to(spoonHandle, {
          attr: { d: `M 25 19.5 Q ${25 + bend} 31.5 25 44` },
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        window.gsap.to(spoonSvg, {
          rotation: relX * 18,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    });

    spoonTrigger.addEventListener('mouseleave', () => {
      triggerRect = null;
      if (isBending) return;
      if (window.gsap) {
        window.gsap.to(spoonHandle, {
          attr: { d: 'M 25 19.5 Q 25 31.5 25 44' },
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
            window.gsap.set(spoonHandle, { attr: { d: 'M 25 19.5 Q 25 31.5 25 44' } });
            window.gsap.set(spoonSvg, { rotation: 0, scale: 1, opacity: 1 });
            // Open matrix
            if (this.matrixEngine) {
              this.matrixEngine.open();
            }
          }
        });

        // 1. Extreme psychic 90-degree kink
        tl.to(spoonHandle, {
          attr: { d: 'M 25 19.5 Q 52 26 25 44' },
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

  /**
   * Initializes timed ethos story progress slider with split-text staggered transitions.
   */
  initEthosSlider() {
    const prevBtn = document.getElementById('ethos-prev-btn');
    const nextBtn = document.getElementById('ethos-next-btn');
    const counterEl = document.getElementById('ethos-counter');
    const progressBar = document.getElementById('ethos-progress-bar');
    const tagEl = document.getElementById('ethos-current-tag');
    if (!prevBtn || !nextBtn || !progressBar) return;

    let currentSlide = 0;
    const totalSlides = this.stories.length;
    const SLIDE_DURATION = 6.0;
    let progressTween = null;
    let isTransitioning = false;

    const startProgress = () => {
      if (progressTween) progressTween.kill();
      if (window.gsap) {
        window.gsap.set(progressBar, { scaleX: 0 });
        progressTween = window.gsap.to(progressBar, {
          scaleX: 1,
          duration: SLIDE_DURATION,
          ease: 'none',
          onComplete: () => {
            updateSlide(currentSlide + 1);
          }
        });
      }
    };

    const updateSlide = (newIndex) => {
      if (isTransitioning) return;
      const slides = document.querySelectorAll('.ethos-story-slide');
      if (!slides.length || totalSlides === 0) return;
      const nextSlideIndex = (newIndex + totalSlides) % totalSlides;
      if (nextSlideIndex === currentSlide) return;

      isTransitioning = true;
      if (progressTween) progressTween.kill();

      const outSlide = slides[currentSlide];
      const inSlide = slides[nextSlideIndex];
      const outWords = outSlide.querySelectorAll('.split-word-inner');
      const inWords = inSlide.querySelectorAll('.split-word-inner');

      if (window.gsap) {
        const tl = window.gsap.timeline({
          onComplete: () => {
            outSlide.classList.remove('active');
            window.gsap.set(outWords, { y: '0%', opacity: 1 });

            inSlide.classList.add('active');
            currentSlide = nextSlideIndex;

            if (counterEl) counterEl.textContent = `0${currentSlide + 1}/0${totalSlides}`;
            if (tagEl && this.stories[currentSlide] && this.stories[currentSlide].tag) {
              tagEl.textContent = this.stories[currentSlide].tag;
            }

            window.gsap.fromTo(inWords, {
              y: '115%',
              opacity: 0
            }, {
              y: '0%',
              opacity: 1,
              stagger: 0.012,
              duration: 0.48,
              ease: 'power3.out',
              onComplete: () => {
                isTransitioning = false;
                startProgress();
              }
            });

            if (tagEl) {
              window.gsap.fromTo(tagEl, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
            }
          }
        });

        tl.to(outWords, {
          y: '-115%',
          opacity: 0,
          stagger: 0.009,
          duration: 0.28,
          ease: 'power3.in'
        });

        if (tagEl) {
          tl.to(tagEl, { y: -6, opacity: 0, duration: 0.18 }, '<');
        }
      } else {
        outSlide.classList.remove('active');
        inSlide.classList.add('active');
        currentSlide = nextSlideIndex;
        if (counterEl) counterEl.textContent = `0${currentSlide + 1}/0${totalSlides}`;
        if (tagEl && this.stories[currentSlide] && this.stories[currentSlide].tag) {
          tagEl.textContent = this.stories[currentSlide].tag;
        }
        isTransitioning = false;
        startProgress();
      }
    };

    // Manual navigation: accelerated 0.2s progress rush
    nextBtn.onclick = () => {
      if (isTransitioning) return;
      if (progressTween) progressTween.kill();
      if (window.gsap) {
        window.gsap.to(progressBar, {
          scaleX: 1,
          duration: 0.2,
          ease: 'power2.out',
          onComplete: () => {
            updateSlide(currentSlide + 1);
          }
        });
      } else {
        updateSlide(currentSlide + 1);
      }
    };

    prevBtn.onclick = () => {
      if (isTransitioning) return;
      if (progressTween) progressTween.kill();
      if (window.gsap) {
        window.gsap.to(progressBar, {
          scaleX: 0,
          duration: 0.18,
          ease: 'power2.out',
          onComplete: () => {
            updateSlide(currentSlide - 1);
          }
        });
      } else {
        updateSlide(currentSlide - 1);
      }
    };

    // Viewport observer: pause progress ticker when off-screen
    const aboutSection = document.getElementById('about');
    if (aboutSection && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!progressTween) {
              startProgress();
            } else if (!isTransitioning) {
              progressTween.resume();
            }
          } else {
            if (progressTween) {
              progressTween.pause();
            }
          }
        });
      }, { threshold: 0.05 });
      observer.observe(aboutSection);
    } else {
      startProgress();
    }
  }
}

new Application();
