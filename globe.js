/**
 * globe.js - Cinematic Ink Convergence Opening Effect
 * 
 * 4-corner ink fluid lines rush toward the center to forge
 * the Vermilion Red Seal Stamp, then self-destroys.
 */

export class InkConvergeAnimation {
  constructor(canvasId = 'ink-converge-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.particles = [];
    this.isDestroyed = false;
    this.progress = 0; // 0 to 1

    this.init();
  }

  init() {
    this.resize();
    this.createInkStreams();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.height = this.height * Math.min(window.devicePixelRatio || 1, 2);
    this.ctx.scale(Math.min(window.devicePixelRatio || 1, 2), Math.min(window.devicePixelRatio || 1, 2));
  }

  createInkStreams() {
    this.particles = [];
    const count = 48;
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // 4 Corner Origin Coordinates
    const corners = [
      { x: 0, y: 0 },
      { x: this.width, y: 0 },
      { x: 0, y: this.height },
      { x: this.width, y: this.height }
    ];

    for (let i = 0; i < count; i++) {
      const corner = corners[i % 4];
      // Random start near corner with jitter
      const startX = corner.x + (Math.random() - 0.5) * 120;
      const startY = corner.y + (Math.random() - 0.5) * 120;

      // Control points for organic curved ink splash
      const cp1X = startX + (centerX - startX) * 0.3 + (Math.random() - 0.5) * 200;
      const cp1Y = startY + (centerY - startY) * 0.3 + (Math.random() - 0.5) * 200;

      this.particles.push({
        startX,
        startY,
        cp1X,
        cp1Y,
        targetX: centerX + (Math.random() - 0.5) * 60,
        targetY: centerY + (Math.random() - 0.5) * 40,
        size: Math.random() * 3.5 + 1.5,
        alpha: Math.random() * 0.6 + 0.3,
        speedOffset: Math.random() * 0.2
      });
    }
  }

  render(p) {
    if (this.isDestroyed) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    for (let i = 0; i < this.particles.length; i++) {
      const pt = this.particles[i];
      const localP = Math.min(1, Math.max(0, (p - pt.speedOffset) / (1 - pt.speedOffset)));
      
      // Quadratic Bezier Interpolation
      const inv = 1 - localP;
      const curX = inv * inv * pt.startX + 2 * inv * localP * pt.cp1X + localP * localP * pt.targetX;
      const curY = inv * inv * pt.startY + 2 * inv * localP * pt.cp1Y + localP * localP * pt.targetY;

      // Ink Trail
      this.ctx.beginPath();
      this.ctx.arc(curX, curY, pt.size * (1 - localP * 0.5), 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(217, 56, 41, ${pt.alpha * (1 - localP * 0.2)})`; // Vermilion ink
      this.ctx.fill();

      // Delicate Connection Splashes
      if (localP > 0.1 && localP < 0.95) {
        this.ctx.beginPath();
        this.ctx.moveTo(curX, curY);
        this.ctx.lineTo(centerX, centerY);
        this.ctx.strokeStyle = `rgba(18, 19, 22, ${0.08 * (1 - localP)})`;
        this.ctx.lineWidth = 0.8;
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

