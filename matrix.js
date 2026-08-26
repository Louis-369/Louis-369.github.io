/**
 * matrix.js - Full-Screen Matrix Digital Rain Engine & Easter Egg Orchestrator
 * 
 * Features:
 * 1. Tri-lingual token dictionary (C++/Assembly logic, Philosophical Chinese metaphors, Japanese katakana/kanji)
 * 2. GSAP Stagger cascade entrance
 * 3. Mouse magnetic repulsion & plasma white-green glow reaction
 * 4. Zero-cost teardown on exit (cancels rAF, clears canvas, removes event listeners)
 */

export class MatrixEngine {
  constructor() {
    this.overlay = document.getElementById('matrix-overlay');
    this.canvas = document.getElementById('matrix-canvas');
    this.exitBtn = document.getElementById('matrix-exit-btn');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.isActive = false;
    this.rafId = null;
    this.columns = [];
    this.mouse = { x: -9999, y: -9999, isHovering: false };
    
    // Curated Tri-Lingual Token Pool
    this.dictionary = {
      code: [
        'int main()', 'void search()', '10110100', '0xFA', '0x00',
        'MATRIX', 'CODE', 'SYSTEM', 'TRUTH', 'REBOOT', 'SYSTEM_RESET',
        'INITIALIZE', 'OVERRIDE', 'RELOAD', 'SHUTDOWN', 'WAKE_UP',
        'EXEC_START', 'KILL_PROCESS'
      ],
      chinese: [
        '真實', '虛擬', '夢境', '覺醒', '解碼', '超越本源',
        '重新啟動', '系統重置', '初始化', '核心重啟', '強制中斷', '覆寫', '載入'
      ],
      japaneseKanji: ['真実', '再起動', '初期化', '復旧'],
      katakanaHalf: ['ﾌﾟﾛｸﾞﾗﾑ', 'ｼｽﾃﾑ', 'ｻｲｷﾄﾞｳ', 'ﾘﾌﾞｰﾄ', 'ﾘｾｯﾄ', 'ｵｰﾊﾞｰﾗｲﾄﾞ'],
      symbols: 'ｱｶｻﾀﾅﾊﾏﾔﾗﾜ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*<>[]{}|:;'
    };

    // Flatten glyph pool for single-character streams
    this.allGlyphs = [
      ...this.dictionary.symbols.split(''),
      ...this.dictionary.katakanaHalf.flatMap(s => s.split('')),
      ...this.dictionary.chinese.flatMap(s => s.split('')),
      ...this.dictionary.japaneseKanji.flatMap(s => s.split(''))
    ];

    this.bindEvents();
  }

  getRandomGlyph() {
    return this.allGlyphs[Math.floor(Math.random() * this.allGlyphs.length)];
  }

  getRandomToken() {
    const categories = ['code', 'chinese', 'japaneseKanji', 'katakanaHalf'];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const list = this.dictionary[cat];
    return list[Math.floor(Math.random() * list.length)];
  }

  initColumns() {
    if (!this.canvas) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const columnWidth = 22; // Column spacing
    const numCols = Math.floor(width / columnWidth);

    this.columns = [];

    for (let i = 0; i < numCols; i++) {
      // Stagger entrance: columns start higher up with progressive stagger delays
      const staggerProgress = i / numCols;
      const initialDelay = staggerProgress * 1.6 + Math.random() * 0.4;
      const speed = 1.2 + Math.random() * 2.2;
      const length = Math.floor(16 + Math.random() * 28);

      // Create stream characters
      const stream = [];
      for (let j = 0; j < length; j++) {
        stream.push({
          glyph: this.getRandomGlyph(),
          mutateTimer: Math.floor(Math.random() * 20)
        });
      }

      this.columns.push({
        x: i * columnWidth + 10,
        y: -length * 20 - (initialDelay * 80),
        baseSpeed: speed,
        speed,
        length,
        fontSize: 14 + (Math.random() > 0.85 ? 4 : 0),
        stream,
        tokenInject: Math.random() > 0.5 ? this.getRandomToken() : null,
        tokenY: Math.floor(Math.random() * length),
        headGlow: Math.random() > 0.3
      });
    }
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  bindEvents() {
    if (this.exitBtn) {
      this.exitBtn.addEventListener('click', () => this.close());
    }

    // Keyboard ESC to close
    window.addEventListener('keydown', (e) => {
      if (this.isActive && (e.key === 'Escape' || e.key === 'Esc')) {
        this.close();
      }
    });

    // Window resize
    window.addEventListener('resize', () => {
      if (this.isActive) {
        this.resize();
        this.initColumns();
      }
    });

    // Mouse magnetic tracking & interaction
    if (this.overlay) {
      this.overlay.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.isHovering = true;
      });

      this.overlay.addEventListener('mouseleave', () => {
        this.mouse.isHovering = false;
        this.mouse.x = -9999;
        this.mouse.y = -9999;
      });
    }
  }

  open() {
    if (this.isActive || !this.overlay || !this.canvas) return;
    this.isActive = true;

    this.overlay.classList.add('is-active');
    this.overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('matrix-open');

    this.resize();
    this.initColumns();

    // GSAP Overlay Entrance Animation
    if (window.gsap) {
      window.gsap.fromTo(this.overlay, 
        { opacity: 0, scale: 1.05 },
        { opacity: 1, scale: 1.0, duration: 0.6, ease: 'power3.out' }
      );
      window.gsap.fromTo('.matrix-hud-top, .matrix-hud-bottom',
        { opacity: 0, y: (i) => i === 0 ? -20 : 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, stagger: 0.1, ease: 'power2.out' }
      );
    }

    this.loop = this.loop.bind(this);
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  close() {
    if (!this.isActive) return;
    
    // GSAP Overlay Exit
    if (window.gsap) {
      window.gsap.to(this.overlay, {
        opacity: 0,
        duration: 0.45,
        ease: 'power2.in',
        onComplete: () => {
          this.teardown();
        }
      });
    } else {
      this.teardown();
    }
  }

  teardown() {
    this.isActive = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.overlay) {
      this.overlay.classList.remove('is-active');
      this.overlay.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('matrix-open');
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.columns = [];
  }

  loop(now) {
    if (!this.isActive || !this.ctx) return;

    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    const ctx = this.ctx;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Semi-transparent black wash for classic phosphorescent trail decay
    ctx.fillStyle = 'rgba(5, 7, 6, 0.15)';
    ctx.fillRect(0, 0, w, h);

    const mouseRadius = 140;
    const mouseRadiusSq = mouseRadius * mouseRadius;

    ctx.textAlign = 'center';

    for (let i = 0; i < this.columns.length; i++) {
      const col = this.columns[i];
      col.y += col.speed * 60 * dt;

      // Wrap back to top once entire stream has exited screen
      if (col.y - col.length * 20 > h) {
        col.y = -col.length * 20 - Math.random() * 80;
        col.speed = 1.2 + Math.random() * 2.4;
        col.tokenInject = Math.random() > 0.4 ? this.getRandomToken() : null;
      }

      ctx.font = `${col.fontSize}px 'Geist Mono', 'Noto Serif TC', monospace`;

      for (let j = 0; j < col.length; j++) {
        const charY = col.y + j * 20;

        // Skip off-screen rendering
        if (charY < -30 || charY > h + 30) continue;

        const item = col.stream[j];
        
        // Organic mutation timer
        item.mutateTimer--;
        if (item.mutateTimer <= 0) {
          item.glyph = this.getRandomGlyph();
          item.mutateTimer = Math.floor(10 + Math.random() * 30);
        }

        let displayChar = item.glyph;

        // Handle embedded tokens (System Commands & Philosophy words)
        if (col.tokenInject && j >= col.tokenY && j < col.tokenY + col.tokenInject.length) {
          const charIndex = j - col.tokenY;
          displayChar = col.tokenInject[charIndex] || item.glyph;
        }

        // ─── Mouse Magnetic Repulsion & Glow Reaction ────────────────
        let renderX = col.x;
        let renderY = charY;
        let isNearMouse = false;
        let mouseIntensity = 0;

        if (this.mouse.isHovering) {
          const dx = renderX - this.mouse.x;
          const dy = renderY - this.mouse.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < mouseRadiusSq && distSq > 1) {
            const dist = Math.sqrt(distSq);
            mouseIntensity = 1 - (dist / mouseRadius);
            const repelForce = (1 - (dist / mouseRadius)) * 32;
            renderX += (dx / dist) * repelForce;
            renderY += (dy / dist) * (repelForce * 0.4);
            isNearMouse = true;
          }
        }

        // ─── Color Grading & Phosphor Glow ───────────────────────────
        const isLeadingHead = j === col.length - 1;

        if (isNearMouse) {
          // Electric Plasma White-Cyan Bloom near cursor
          ctx.fillStyle = `rgba(255, 255, 255, ${0.9 + mouseIntensity * 0.1})`;
          ctx.shadowColor = '#00FF41';
          ctx.shadowBlur = 12 + mouseIntensity * 16;
        } else if (isLeadingHead && col.headGlow) {
          // High-Intensity Pure White Leader Head
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#00FF41';
          ctx.shadowBlur = 10;
        } else {
          // Phosphor Green Trail Falloff (from vivid green to deep stealth emerald)
          const trailDepth = j / col.length;
          const alpha = Math.max(0.12, Math.pow(trailDepth, 1.8));
          
          if (trailDepth > 0.85) {
            ctx.fillStyle = `rgba(180, 255, 190, ${alpha})`;
          } else if (trailDepth > 0.5) {
            ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
          } else {
            ctx.fillStyle = `rgba(0, 180, 45, ${alpha * 0.8})`;
          }
          ctx.shadowBlur = 0;
        }

        ctx.fillText(displayChar, renderX, renderY);
      }
    }

    this.rafId = requestAnimationFrame(this.loop);
  }
}
