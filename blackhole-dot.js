/**
 * @file blackhole-dot.js
 * @description Self-contained WebGL GLSL Black Hole Singularity Dot.
 * Implements authentic 45° 3D tilted accretion disk, Keplerian differential fluid rotation,
 * FBM plasma turbulence, spiral vortex arms, Gaussian photon ring, and GSAP magnetic cursor attraction.
 */

export class BlackHoleDot {
  /**
   * @param {HTMLElement} wrapEl - The .magnetic-wrap element
   * @param {Object} options
   * @param {'A'|'B'|'C'} [options.variant='A'] - Color & optical variant (A: Noir Eclipse, B: Sumi Ink Vortex, C: Gargantua Amber)
   * @param {boolean} [options.cycle=false] - When true, sequentially cycles through variants on each click
   * @param {string[]} [options.variants=['A','B','C']] - Variant sequence when cycling
   * @param {function|null} [options.onVariantChange=null] - Callback triggered when variant changes
   * @param {number} [options.movement=0.55] - Magnetic attraction strength
   * @param {HTMLElement|null} [options.gravTextEl=null] - Text element to pull during black hole burst
   * @param {HTMLElement|null} [options.gravSubEl=null] - Subtitle element to pull during black hole burst
   */
  constructor(wrapEl, options = {}) {
    this.wrapEl = wrapEl;
    if (!this.wrapEl) return;

    this.variant = options.variant || 'A';
    this.cycle = options.cycle !== undefined ? options.cycle : false;
    this.variants = options.variants || ['A', 'B', 'C'];
    this.variantIndex = options.initialIndex !== undefined 
      ? options.initialIndex 
      : Math.max(0, this.variants.indexOf(this.variant));
    this.onVariantChange = options.onVariantChange || null;

    this.movement = options.movement !== undefined ? options.movement : 0.55;
    this.gravTextEl = options.gravTextEl || null;
    this.gravSubEl = options.gravSubEl || null;

    this.mArea = this.wrapEl.querySelector('.js-magnetic-area');
    this.mContent = this.wrapEl.querySelector('.js-magnetic-content');
    this.dotCore = this.wrapEl.querySelector('.bh-dot-core');
    this.canvas = this.wrapEl.querySelector('.bh-shader-canvas');

    this.burstProgress = 0.0; // 0 = pure dot, 1 = full accretion disk & photon ring
    this.isAnimating = false;
    this.startTime = performance.now();

    this.initParticles();
    this.initWebGL();
    this.bindEvents();
    this.renderLoop = this.renderLoop.bind(this);
    requestAnimationFrame(this.renderLoop);
  }

  initParticles() {
    if (!this.gravSubEl) {
      this.particles = [];
      return;
    }
    let particles = Array.from(this.gravSubEl.querySelectorAll('.bh-word-particle'));
    if (!particles.length) {
      // Auto-tokenize plain text nodes into .bh-word-particle if not already wrapped
      const text = this.gravSubEl.textContent.trim();
      if (text) {
        const words = text.split(/(\s+)/);
        this.gravSubEl.innerHTML = words.map(w => w.trim() ? `<span class="bh-word-particle">${w}</span>` : w).join('');
        particles = Array.from(this.gravSubEl.querySelectorAll('.bh-word-particle'));
      }
    }
    this.particles = particles;
  }

  initWebGL() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 240; // Local high-DPI square canvas around the dot
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;

    const gl = this.canvas.getContext('webgl', {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: true,
      premultipliedAlpha: false
    });
    if (!gl) return;
    this.gl = gl;

    const VERT = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const FRAG = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uBurst;
      uniform int uVariant;

      float rand(vec2 n) {
        return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 ip = floor(p);
        vec2 u = fract(p);
        u = u * u * (3.0 - 2.0 * u);
        float res = mix(
          mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
          mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
          u.y
        );
        return res * res;
      }

      float fbm(vec2 p, float timeOffset) {
        float total = 0.0;
        float amplitude = 0.65;
        for (int i = 0; i < 4; i++) {
          float timeScale = 0.6 + 0.15 * float(i);
          float noiseVal = noise(p * 2.0 + vec2(timeOffset * timeScale * 0.5, timeOffset * timeScale * 0.35));
          total += amplitude * noiseVal;
          p += vec2(noiseVal * 0.2, -noiseVal * 0.15);
          p *= 2.1;
          amplitude *= 0.5;
        }
        return total;
      }

      void main() {
        if (uBurst <= 0.001) {
          gl_FragColor = vec4(0.0);
          return;
        }

        // Center coordinate in [-0.5, 0.5]
        vec2 toCenter = vUv - vec2(0.5, 0.5);
        float rPhys = length(toCenter);

        // 1. 45° Tilt Matrix (3D Inclined Accretion Disk with 2.2x pitch foreshortening)
        float cos45 = 0.7071068;
        float sin45 = 0.7071068;
        vec2 tiltedP = vec2(
          toCenter.x * cos45 + toCenter.y * sin45,
          (-toCenter.x * sin45 + toCenter.y * cos45) * 2.2
        );
        float r = length(tiltedP);

        // Disk radii expand smoothly from the center period dot
        float diskOuter = 0.44 * uBurst;
        float diskInner = diskOuter * 0.20;

        vec3 finalCol = vec3(0.0);
        float finalAlpha = 0.0;

        // 2. Ambient Gravitational Dark Void Stage (ensures high contrast on warm oatmeal paper)
        float shadowRadius = 0.46 * uBurst;
        if (rPhys < shadowRadius) {
          float shadowMask = 1.0 - smoothstep(diskInner * 0.5, shadowRadius, rPhys);
          shadowMask = pow(shadowMask, 1.5);
          if (uVariant == 0) {
            // Variant A: Deep Noir Eclipse Void
            finalCol = vec3(0.05, 0.05, 0.06);
            finalAlpha = shadowMask * 0.92 * uBurst;
          } else if (uVariant == 1) {
            // Variant B: Subtle Sumi Ink Wash Halo
            finalCol = vec3(0.07, 0.07, 0.08);
            finalAlpha = shadowMask * 0.45 * uBurst;
          } else {
            // Variant C: Gargantua Obsidian Warm Void
            finalCol = vec3(0.06, 0.04, 0.03);
            finalAlpha = shadowMask * 0.94 * uBurst;
          }
        }

        // 3. Keplerian Fluid Accretion Disk + FBM Turbulence + Spiral Vortex Arms
        if (r < diskOuter) {
          float normR = clamp((r - diskInner) / max(diskOuter - diskInner, 0.0001), 0.0, 1.0);
          float angle = atan(tiltedP.y, tiltedP.x);

          // Authentic Keplerian Differential Orbital Velocity (inner spins much faster)
          float rotSpeed = 3.5 / (pow(r * 6.5, 1.2) + 0.65);
          float rotAngle = angle - uTime * rotSpeed * 2.6;
          vec2 diskCoord = vec2(r * 4.5, rotAngle * 2.5);

          float fbmPattern = fbm(diskCoord, uTime * 0.55);

          // Keplerian Spiral Vortex Arms
          float spiral = sin(rotAngle * 2.0 + r * 24.0 - uTime * 5.5);
          float arm = smoothstep(-0.3, 0.7, spiral) * 0.45;
          float totalPattern = fbmPattern * 0.72 + arm;

          // Gaussian Relativistic Photon Ring at inner event horizon rim
          float photonRing = exp(-pow((normR - 0.08) * 16.0, 2.0)) * 2.4;

          vec3 diskColor = vec3(0.0);
          float diskAlpha = smoothstep(0.0, 0.06, normR) * (1.0 - smoothstep(0.80, 1.0, normR));
          diskAlpha *= clamp(uBurst * 1.4, 0.0, 1.0);

          if (uVariant == 0) {
            // Variant A: Solar Eclipse & Noir Lensing (White-hot spine -> Champagne Silver -> Charcoal)
            vec3 colorHot = vec3(1.0, 0.99, 0.96);
            vec3 colorMid = vec3(0.82, 0.79, 0.73);
            vec3 colorDeep = vec3(0.10, 0.10, 0.12);
            diskColor = mix(colorHot, colorMid, smoothstep(0.0, 0.45, normR));
            diskColor = mix(diskColor, colorDeep, smoothstep(0.45, 1.0, normR));
            diskColor *= (totalPattern + 0.45) * 1.65;
            diskColor += vec3(1.0, 0.99, 0.95) * photonRing;
          } else if (uVariant == 1) {
            // Variant B: Pure Monochrome Sumi Ink Vortex (High-contrast dark ink arms + crisp silver rim)
            vec3 colorHot = vec3(0.96, 0.95, 0.92);
            vec3 colorInk = vec3(0.07, 0.07, 0.09);
            float inkBand = clamp(totalPattern * 1.6, 0.0, 1.0);
            diskColor = mix(colorInk, colorHot, inkBand * (1.0 - normR * 0.7));
            diskColor += vec3(0.98, 0.97, 0.95) * (photonRing * 0.9);
            diskAlpha = clamp(diskAlpha * (0.65 + inkBand * 0.6), 0.0, 1.0);
          } else {
            // Variant C: Interstellar Gargantua (Superheated Cream Gold -> Fiery Amber -> Obsidian)
            vec3 colorHot = vec3(1.0, 0.95, 0.82);
            vec3 colorMid = vec3(0.98, 0.52, 0.14);
            vec3 colorDeep = vec3(0.14, 0.05, 0.02);
            diskColor = mix(colorHot, colorMid, smoothstep(0.0, 0.45, normR));
            diskColor = mix(diskColor, colorDeep, smoothstep(0.45, 1.0, normR));
            diskColor *= (totalPattern + 0.48) * 1.75;
            diskColor += vec3(1.0, 0.88, 0.65) * photonRing;
          }

          finalCol = mix(finalCol, diskColor, diskAlpha);
          finalAlpha = max(finalAlpha, diskAlpha);

          // 4. Event Horizon Core (Solid Black Center matching the '.' dot)
          if (r < diskInner) {
            float innerMask = 1.0 - smoothstep(diskInner * 0.82, diskInner, r);
            finalCol = mix(finalCol, vec3(0.05, 0.05, 0.06), innerMask);
            finalAlpha = max(finalAlpha, innerMask);
          }
        }

        gl_FragColor = vec4(finalCol, finalAlpha);
      }
    `;

    const vs = this.compileShader(gl.VERTEX_SHADER, VERT);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, FRAG);
    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    const posLoc = gl.getAttribLocation(this.program, 'aPosition');
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    this.uTime = gl.getUniformLocation(this.program, 'uTime');
    this.uBurst = gl.getUniformLocation(this.program, 'uBurst');
    this.uVariant = gl.getUniformLocation(this.program, 'uVariant');
  }

  compileShader(type, source) {
    const gl = this.gl;
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    return s;
  }

  bindEvents() {
    if (!this.mArea || !this.mContent) return;
    const gsap = window.gsap;

    // 1. True Centripetal Magnetic Cursor Attraction (Zero repulsion, zero offset)
    this.mArea.addEventListener('mousemove', (e) => {
      if (!gsap) return;
      const rect = this.mArea.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;

      // Positive delta pulls the dot directly TOWARD the mouse cursor
      const deltaX = (e.clientX - centerX) * this.movement;
      const deltaY = (e.clientY - centerY) * this.movement;

      gsap.to(this.mContent, {
        x: deltaX,
        y: deltaY,
        ease: 'power2.out',
        duration: 0.45,
        overwrite: 'auto'
      });
    });

    this.mArea.addEventListener('mouseleave', () => {
      if (!gsap) return;
      gsap.to(this.mContent, {
        x: 0,
        y: 0,
        ease: 'elastic.out(1, 0.4)',
        duration: 0.7,
        overwrite: 'auto'
      });
    });

    // 2. Click to trigger 45° Keplerian Black Hole Accretion Disk & Gravitational Pull
    this.mArea.addEventListener('click', (e) => {
      e.stopPropagation();
      this.triggerBurst();
    });
  }

  triggerBurst() {
    const gsap = window.gsap;
    if (!gsap) return;

    if (this.cycle) {
      this.variant = this.variants[this.variantIndex];
      this.variantIndex = (this.variantIndex + 1) % this.variants.length;
      if (typeof this.onVariantChange === 'function') {
        this.onVariantChange(this.variant);
      }
    }

    gsap.killTweensOf(this);
    if (this.dotCore) gsap.killTweensOf(this.dotCore);
    if (this.gravTextEl) gsap.killTweensOf(this.gravTextEl);
    if (this.gravSubEl) gsap.killTweensOf(this.gravSubEl);
    if (this.particles && this.particles.length) gsap.killTweensOf(this.particles);

    const tl = gsap.timeline();

    // 點觸發後立即隱藏實體圓點，讓 3D WebGL 著色器接管視覺
    if (this.dotCore) {
      tl.to(this.dotCore, {
        opacity: 0,
        duration: 0.12,
        ease: 'power2.out'
      }, 0);
    }

    // Phase 1: 45° Accretion Disk + Keplerian Fluid + Photon Ring burst out of the '.'
    tl.to(this, {
      burstProgress: 1.0,
      duration: 0.48,
      ease: 'power3.out'
    }, 0);

    // Pull surrounding 'Louis' text toward the black hole dot
    if (this.gravTextEl) {
      tl.to(this.gravTextEl, {
        x: 9,
        skewX: -3.5,
        scale: 0.975,
        duration: 0.55,
        ease: 'power2.out'
      }, 0);
    }

    // 單字粒子亂序引力吸入（個別單字以向量差飛向黑洞奇異點）
    if (this.particles && this.particles.length) {
      const dotRect = this.dotCore ? this.dotCore.getBoundingClientRect() : null;

      tl.to(this.particles, {
        x: (i, el) => {
          if (!dotRect) return 20;
          const rect = el.getBoundingClientRect();
          return (dotRect.left + dotRect.width * 0.5) - (rect.left + rect.width * 0.5);
        },
        y: (i, el) => {
          if (!dotRect) return -40;
          const rect = el.getBoundingClientRect();
          return (dotRect.top + dotRect.height * 0.5) - (rect.top + rect.height * 0.5);
        },
        scale: 0,
        rotation: () => (Math.random() - 0.5) * 55,
        skewX: () => (Math.random() - 0.5) * 35,
        opacity: 0,
        filter: 'blur(3px)',
        duration: 0.45,
        ease: 'power3.in',
        stagger: {
          amount: 0.35,
          from: 'random' // 偽隨機亂序被吸入
        }
      }, 0);

      // Phase 3: 黑洞於 2.15s 坍縮完畢後，單字在原地破土萌生，並帶有左右搖曳波浪
      tl.set(this.particles, {
        x: 0,
        y: 14,
        scale: 0,
        rotation: 0,
        skewX: 0,
        filter: 'blur(0px)',
        opacity: 0
      }, 2.15);

      // 向上生長
      tl.to(this.particles, {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.48,
        ease: 'back.out(2.2)',
        stagger: {
          amount: 0.38,
          from: 'start'
        }
      }, 2.15);

      // 原地左右搖曳回正（像春風吹過草木）
      tl.to(this.particles, {
        keyframes: [
          { rotation: (i) => (i % 2 === 0 ? 5.0 : -5.0), duration: 0.18, ease: 'sine.out' },
          { rotation: (i) => (i % 2 === 0 ? -3.2 : 3.2), duration: 0.22, ease: 'sine.inOut' },
          { rotation: (i) => (i % 2 === 0 ? 1.6 : -1.6), duration: 0.20, ease: 'sine.inOut' },
          { rotation: 0, duration: 0.25, ease: 'sine.inOut' }
        ],
        stagger: {
          amount: 0.38,
          from: 'start'
        }
      }, 2.15);
    } else if (this.gravSubEl) {
      tl.to(this.gravSubEl, {
        y: -4,
        scale: 0.985,
        duration: 0.55,
        ease: 'power2.out'
      }, 0);

      tl.to(this.gravSubEl, {
        y: 0,
        scale: 1,
        duration: 0.75,
        ease: 'back.out(1.8)'
      }, 1.70);
    }

    // Phase 2: 天體級相對論高速旋轉，於 1.65s 開始向核心強烈坍縮，總耗時精準回歸 2.15s
    tl.to(this, {
      burstProgress: 0.0,
      duration: 0.50,
      ease: 'power3.in'
    }, 1.65);

    if (this.gravTextEl) {
      tl.to(this.gravTextEl, {
        x: 0,
        skewX: 0,
        scale: 1,
        duration: 0.85,
        ease: 'elastic.out(1.2, 0.4)'
      }, 1.70);
    }

    // 坍縮結束瞬間（2.13s ~ 2.15s）零延遲無縫凝結重現
    if (this.dotCore) {
      tl.to(this.dotCore, {
        opacity: 1,
        duration: 0.16,
        ease: 'power2.out'
      }, 2.13);
    }
  }

  renderLoop(now) {
    requestAnimationFrame(this.renderLoop);
    if (!this.gl) return;

    // Only run GPU draw pass when burstProgress > 0 (zero idle GPU usage!)
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (this.burstProgress <= 0.001) return;

    gl.useProgram(this.program);
    gl.uniform1f(this.uTime, (now - this.startTime) * 0.001);
    gl.uniform1f(this.uBurst, this.burstProgress);
    const variantIdx = this.variant === 'B' ? 1 : (this.variant === 'C' ? 2 : 0);
    gl.uniform1i(this.uVariant, variantIdx);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
