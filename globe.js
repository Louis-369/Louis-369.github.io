/**
 * globe.js - Zen Fallen Leaf & Dual-Stage Water Ripple Animation Engine
 * 
 * 1. Stage 1: Leaf Touches Water Surface -> Generates 3 delicate concentric ripples
 * 2. Stage 2: Leaf Sinks -> Triggers explosive full-screen shockwave ripple
 */

export class ZenRippleAnimation {
  constructor(canvasId = 'zen-ripple-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isDestroyed = false;

    // Stage 1 Touch Ripple Progress (0 to 1)
    this.touchRippleProgress = 0;
    // Stage 2 Deep Shockwave Progress (0 to 1)
    this.shockwaveProgress = 0;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.height = this.height * Math.min(window.devicePixelRatio || 1, 2);
    this.ctx.scale(Math.min(window.devicePixelRatio || 1, 2), Math.min(window.devicePixelRatio || 1, 2));
  }

  render() {
    if (this.isDestroyed) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // 1. Render First Stage Delicate Touch Ripples
    if (this.touchRippleProgress > 0 && this.touchRippleProgress < 1) {
      const p = this.touchRippleProgress;
      const waveCount = 3;

      for (let i = 0; i < waveCount; i++) {
        const localP = Math.max(0, p - i * 0.18);
        if (localP > 0 && localP <= 1) {
          const radius = localP * 180 + 10;
          const alpha = (1 - localP) * 0.45;

          // Water ripple contour
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          this.ctx.strokeStyle = `rgba(18, 19, 22, ${alpha})`;
          this.ctx.lineWidth = 1.5 * (1 - localP * 0.5);
          this.ctx.stroke();

          // Subtle inner water displacement shadow
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, radius - 2, 0, Math.PI * 2);
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
          this.ctx.lineWidth = 1.0;
          this.ctx.stroke();
        }
      }
    }

    // 2. Render Second Stage Deep Water Shockwave Ripple (Full-Screen Sweep)
    if (this.shockwaveProgress > 0 && this.shockwaveProgress < 1) {
      const p = this.shockwaveProgress;
      const maxRadius = Math.sqrt(this.width * this.width + this.height * this.height) * 0.65;
      const radius = p * maxRadius;
      const alpha = Math.pow(1 - p, 1.4) * 0.7;

      // Heavy deep water primary crest
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(18, 19, 22, ${alpha})`;
      this.ctx.lineWidth = 3.5 * (1 - p * 0.7);
      this.ctx.stroke();

      // Secondary shockwave refraction ring
      if (p > 0.08) {
        const subRadius = (p - 0.08) * maxRadius;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, subRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(217, 56, 41, ${alpha * 0.5})`; // Vermilion light echo
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
      }
    }
  }

  destroy() {
    this.isDestroyed = true;
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

