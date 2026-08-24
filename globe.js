/**
 * globe.js - Organic Metaball Liquid Droplets Coalescence Opening Effect
 * 
 * Flowing liquid water/ink droplets surge from 4 corners,
 * merge with organic surface tension via Gooey blending,
 * and coalesce into a central molten vermilion ink pool.
 */

export class InkConvergeAnimation {
  constructor(canvasId = 'ink-converge-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.droplets = [];
    this.isDestroyed = false;

    this.init();
  }

  init() {
    this.resize();
    this.createLiquidDroplets();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.height = this.height * Math.min(window.devicePixelRatio || 1, 2);
    this.ctx.scale(Math.min(window.devicePixelRatio || 1, 2), Math.min(window.devicePixelRatio || 1, 2));
  }

  createLiquidDroplets() {
    this.droplets = [];
    const count = 36;
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    const corners = [
      { x: -40, y: -40 },
      { x: this.width + 40, y: -40 },
      { x: -40, y: this.height + 40 },
      { x: this.width + 40, y: this.height + 40 }
    ];

    for (let i = 0; i < count; i++) {
      const corner = corners[i % 4];
      const startX = corner.x + (Math.random() - 0.5) * 80;
      const startY = corner.y + (Math.random() - 0.5) * 80;

      // S-curve organic fluid control points
      const cp1X = startX + (centerX - startX) * 0.45 + (Math.random() - 0.5) * 220;
      const cp1Y = startY + (centerY - startY) * 0.45 + (Math.random() - 0.5) * 220;

      this.droplets.push({
        startX,
        startY,
        cp1X,
        cp1Y,
        targetX: centerX + (Math.random() - 0.5) * 50,
        targetY: centerY + (Math.random() - 0.5) * 30,
        // Large organic droplet radii (16px to 38px) for full fluid blob merge
        radius: Math.random() * 22 + 16,
        tailRadius: Math.random() * 8 + 4,
        speedOffset: (i % 6) * 0.05
      });
    }
  }

  render(p) {
    if (this.isDestroyed) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Central Coalesced Ink Reservoir that grows as droplets arrive
    if (p > 0.35) {
      const coreRadius = Math.min(110, (p - 0.35) * 160);
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#D93829';
      this.ctx.fill();
    }

    // Render each rushing fluid droplet & trailing water bead
    for (let i = 0; i < this.droplets.length; i++) {
      const drop = this.droplets[i];
      const localP = Math.min(1, Math.max(0, (p - drop.speedOffset) / (1 - drop.speedOffset)));
      
      const inv = 1 - localP;
      // Head position
      const headX = inv * inv * drop.startX + 2 * inv * localP * drop.cp1X + localP * localP * drop.targetX;
      const headY = inv * inv * drop.startY + 2 * inv * localP * drop.cp1Y + localP * localP * drop.targetY;

      // Trailing tail position (slight delay)
      const tailLocalP = Math.max(0, localP - 0.08);
      const tailInv = 1 - tailLocalP;
      const tailX = tailInv * tailInv * drop.startX + 2 * tailInv * tailLocalP * drop.cp1X + tailLocalP * tailLocalP * drop.targetX;
      const tailY = tailInv * tailInv * drop.startY + 2 * tailInv * tailLocalP * drop.cp1Y + tailLocalP * tailLocalP * drop.targetY;

      // Main Droplet Body
      this.ctx.beginPath();
      this.ctx.arc(headX, headY, drop.radius * (1 + localP * 0.3), 0, Math.PI * 2);
      this.ctx.fillStyle = '#D93829'; // Vermilion Red Liquid
      this.ctx.fill();

      // Liquid Connecting Neck (Surface Tension Stretch)
      if (localP > 0.05 && localP < 0.92) {
        this.ctx.beginPath();
        this.ctx.arc(tailX, tailY, drop.tailRadius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(headX, headY);
        this.ctx.lineTo(tailX, tailY);
        this.ctx.strokeStyle = '#D93829';
        this.ctx.lineWidth = drop.radius * 1.1;
        this.ctx.lineCap = 'round';
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

