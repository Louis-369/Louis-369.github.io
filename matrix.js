/**
 * matrix.js - Full-Screen Matrix Digital Rain Engine & Easter Egg Orchestrator
 * 
 * Features:
 * 1. White cursor respiration -> Typewriter `> reset` sequence -> Flash launch
 * 2. Tri-lingual token dictionary (C++/Assembly logic, Philosophical Chinese metaphors, Japanese katakana/kanji)
 * 3. Pure pitch-black high-contrast canvas without green shadow pollution
 * 4. GSAP Stagger cascade entrance
 * 5. Mouse magnetic repulsion & plasma white-green glow reaction
 * 6. Zero-cost teardown on exit
 */

export class MatrixEngine {
  constructor() {
    this.overlay = document.getElementById('matrix-overlay');
    this.canvas = document.getElementById('matrix-canvas');
    this.exitBtn = document.getElementById('matrix-exit-btn');
    this.typewriterWrap = document.getElementById('matrix-typewriter-wrap');
    this.typewriterText = document.getElementById('typewriter-text');
    this.typewriterCursor = document.getElementById('typewriter-cursor');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.isActive = false;
    this.isRainRunning = false;
    this.rafId = null;
    this.typeInterval = null;
    this.typeTimeout = null;
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
      const initialDelay = staggerProgress * 1.4 + Math.random() * 0.35;
      const speed = 1.4 + Math.random() * 2.2;
      const length = Math.floor(16 + Math.random() * 26);

      // Create stream characters
      const stream = [];
      for (let j = 0; j < length; j++) {
        stream.push({
          glyph: this.getRandomGlyph(),
          mutateTimer: Math.floor(Math.random() * 20)
        });
      }

      this.columns.push({
        x: i * columnWidth + 11,
        y: -length * 20 - (initialDelay * 70),
        baseSpeed: speed,
        speed,
        length,
        fontSize: 14 + (Math.random() > 0.85 ? 3 : 0),
        stream,
        tokenInject: Math.random() > 0.45 ? this.getRandomToken() : null,
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
      this.bindScrambleButton();
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
        if (this.isRainRunning) {
          this.initColumns();
        }
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

  bindScrambleButton() {
    if (!this.exitBtn) return;
    const textSpan = this.exitBtn.querySelector('span') || this.exitBtn;
    const targetText = 'EXIT';
    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let scrambleInterval = null;

    this.exitBtn.addEventListener('mouseenter', () => {
      let iteration = 0;
      clearInterval(scrambleInterval);

      scrambleInterval = setInterval(() => {
        textSpan.textContent = targetText
          .split('')
          .map((letter, index) => {
            if (index < Math.floor(iteration)) {
              return targetText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');

        if (iteration >= targetText.length) {
          clearInterval(scrambleInterval);
          textSpan.textContent = targetText;
        }

        iteration += 1 / 3;
      }, 30);
    });

    this.exitBtn.addEventListener('mouseleave', () => {
      clearInterval(scrambleInterval);
      textSpan.textContent = targetText;
    });
  }

  open() {
    if (this.isActive || !this.overlay || !this.canvas) return;
    this.isActive = true;
    this.isRainRunning = false;

    this.overlay.classList.add('is-active');
    this.overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('matrix-open');

    this.resize();

    // Reset and clear canvas to pure pitch black
    if (this.ctx) {
      this.ctx.shadowBlur = 0;
      this.ctx.shadowColor = 'transparent';
      this.ctx.fillStyle = '#050706';
      this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }

    // GSAP Overlay Fade In
    if (window.gsap) {
      window.gsap.fromTo(this.overlay, 
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
      window.gsap.fromTo('.matrix-hud-top, .matrix-hud-bottom',
        { opacity: 0, y: (i) => i === 0 ? -15 : 15 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power2.out' }
      );
    }

    // Start Central White Cursor & Typewriter sequence
    this.playTypewriterIntro();
  }

  playTypewriterIntro() {
    if (this.typewriterText) this.typewriterText.textContent = '';
    if (this.typewriterWrap) {
      this.typewriterWrap.style.display = 'flex';
      this.typewriterWrap.style.opacity = '1';
      this.typewriterWrap.style.transform = 'translate(-50%, -50%) scale(1)';
    }

    const command = '> reset';
    let charIdx = 0;

    // 1. Initial white cursor breathing pause (500ms)
    this.typeTimeout = setTimeout(() => {
      if (!this.isActive) return;

      // 2. Typewriter typing out '> reset'
      this.typeInterval = setInterval(() => {
        if (!this.isActive) {
          clearInterval(this.typeInterval);
          return;
        }

        charIdx++;
        if (this.typewriterText) {
          this.typewriterText.textContent = command.slice(0, charIdx);
        }

        if (charIdx >= command.length) {
          clearInterval(this.typeInterval);
          this.typeInterval = null;

          // 3. Pause 350ms -> pulse dissolve -> trigger waterfall digital rain
          this.typeTimeout = setTimeout(() => {
            if (!this.isActive) return;

            if (window.gsap && this.typewriterWrap) {
              window.gsap.to(this.typewriterWrap, {
                scale: 1.35,
                opacity: 0,
                duration: 0.35,
                ease: 'power3.in',
                onComplete: () => {
                  if (this.typewriterWrap) this.typewriterWrap.style.display = 'none';
                }
              });
            } else if (this.typewriterWrap) {
              this.typewriterWrap.style.display = 'none';
            }

            this.startDigitalRain();
          }, 350);
        }
      }, 95);
    }, 550);
  }

  startDigitalRain() {
    if (!this.isActive) return;
    this.isRainRunning = true;
    this.initColumns();

    this.loop = this.loop.bind(this);
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  close() {
    if (!this.isActive) return;
    
    // Clear all intro timers
    if (this.typeInterval) {
      clearInterval(this.typeInterval);
      this.typeInterval = null;
    }
    if (this.typeTimeout) {
      clearTimeout(this.typeTimeout);
      this.typeTimeout = null;
    }

    // GSAP Overlay Exit
    if (window.gsap) {
      window.gsap.to(this.overlay, {
        opacity: 0,
        duration: 0.4,
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
    this.isRainRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.overlay) {
      this.overlay.classList.remove('is-active');
      this.overlay.setAttribute('aria-hidden', 'true');
    }
    if (this.typewriterWrap) {
      this.typewriterWrap.style.display = 'none';
    }
    if (this.typewriterText) {
      this.typewriterText.textContent = '';
    }
    document.body.classList.remove('matrix-open');
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.columns = [];
  }

  loop(now) {
    if (!this.isActive || !this.isRainRunning || !this.ctx) return;

    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    const ctx = this.ctx;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Reset shadow state before clearing background to prevent green bloom accumulation
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Deep Pitch-Black semi-transparent wash for crisp phosphorescent trail falloff
    ctx.fillStyle = 'rgba(5, 7, 6, 0.20)';
    ctx.fillRect(0, 0, w, h);

    const mouseRadius = 140;
    const mouseRadiusSq = mouseRadius * mouseRadius;

    ctx.textAlign = 'center';

    for (let i = 0; i < this.columns.length; i++) {
      const col = this.columns[i];
      col.y += col.speed * 60 * dt;

      // Wrap back to top once entire stream has exited screen
      if (col.y - col.length * 20 > h) {
        col.y = -col.length * 20 - Math.random() * 70;
        col.speed = 1.3 + Math.random() * 2.3;
        col.tokenInject = Math.random() > 0.45 ? this.getRandomToken() : null;
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
            const repelForce = (1 - (dist / mouseRadius)) * 34;
            renderX += (dx / dist) * repelForce;
            renderY += (dy / dist) * (repelForce * 0.4);
            isNearMouse = true;
          }
        }

        // ─── Color Grading & Phosphor Glow ───────────────────────────
        const isLeadingHead = j === col.length - 1;

        if (isNearMouse) {
          // Electric Plasma White-Cyan Bloom near cursor
          ctx.fillStyle = `rgba(255, 255, 255, ${0.95 + mouseIntensity * 0.05})`;
          ctx.shadowColor = '#00FF41';
          ctx.shadowBlur = 8 + mouseIntensity * 12;
          ctx.fillText(displayChar, renderX, renderY);
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
        } else if (isLeadingHead && col.headGlow) {
          // Pure White Crisp Leader Head with tight green aura
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#00FF41';
          ctx.shadowBlur = 8;
          ctx.fillText(displayChar, renderX, renderY);
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
        } else {
          // Razor-Sharp Phosphor Green Trail (Zero blur bleed, 100% crisp high-contrast)
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
          const trailDepth = j / col.length;
          const alpha = Math.max(0.14, Math.pow(trailDepth, 1.6));
          
          if (trailDepth > 0.82) {
            ctx.fillStyle = `rgba(180, 255, 190, ${alpha})`;
          } else if (trailDepth > 0.45) {
            ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
          } else {
            ctx.fillStyle = `rgba(0, 160, 40, ${alpha * 0.85})`;
          }
          ctx.fillText(displayChar, renderX, renderY);
        }
      }
    }

    this.rafId = requestAnimationFrame(this.loop);
  }
}
