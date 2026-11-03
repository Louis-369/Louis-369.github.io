/**
 * @file spoon-easter-egg.js
 * @description Psychic silver spoon physics micro-interaction and Matrix digital rain easter egg.
 * Universally mounted across all pages (Home, Blog, Photos, Editorial articles).
 */

import { MatrixEngine } from './matrix.js';

export function initSpoonEasterEgg() {
  const spoonTrigger = document.getElementById('footer-spoon-trigger');
  const spoonHandle = document.getElementById('spoon-handle-path');
  const spoonSvg = document.getElementById('spoon-svg-elem');
  if (!spoonTrigger || !spoonHandle || !spoonSvg) return;

  // Prevent duplicate initialization
  if (spoonTrigger.dataset.spoonInitialized === 'true') return;
  spoonTrigger.dataset.spoonInitialized = 'true';

  const matrixEngine = new MatrixEngine();
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
    } else {
      spoonHandle.setAttribute('d', `M 25 19.5 Q ${25 + bend} 31.5 25 44`);
      spoonSvg.style.transform = `rotate(${relX * 18}deg)`;
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
    } else {
      spoonHandle.setAttribute('d', 'M 25 19.5 Q 25 31.5 25 44');
      spoonSvg.style.transform = 'none';
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
          if (matrixEngine) {
            matrixEngine.open();
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
      isBending = false;
      spoonHandle.setAttribute('d', 'M 25 19.5 Q 25 31.5 25 44');
      spoonSvg.style.transform = 'none';
      if (matrixEngine) {
        matrixEngine.open();
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

// Auto mount on script load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSpoonEasterEgg);
} else {
  initSpoonEasterEgg();
}
