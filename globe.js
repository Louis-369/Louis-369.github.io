/**
 * globe.js - Three.js Point-Cloud Particle Globe Engine
 * 
 * Implements:
 * - Fibonacci point-cloud sphere with continent clusters & ocean fields
 * - Cursor Gravity Dimple physics (inward radial displacement)
 * - Kinetic Staging & Camera Lerp (offset & rotation)
 * - Live coordinate broadcast for HUD readout
 * - Lightweight performance tiering & reduced-motion support
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class PlanetGlobe {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.options = Object.assign({
      onCoordinateUpdate: null,
      sectors: []
    }, options);

    this.isMobile = window.innerWidth <= 768;
    this.isLowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || this.isMobile;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.particleCount = this.isLowPower ? 1800 : 4200;
    this.sphereRadius = 3.2;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.geometry = null;
    this.material = null;

    // Position arrays
    this.basePositions = null;
    this.currentPositions = null;
    this.sizes = null;
    this.colors = null;
    this.isContinent = null;

    // Movement & Rotation State
    this.autoRotateSpeed = this.prefersReducedMotion ? 0 : 0.0018;
    this.isResting = true;
    
    // Rotations in radians
    this.currentRotY = 0;
    this.currentRotX = 0.2;
    this.targetRotY = 0;
    this.targetRotX = 0.2;

    // Kinetic stage offsets (in normalized screen space / 3D translation)
    this.currentOffsetX = 0;
    this.currentOffsetY = 0;
    this.currentScale = 1;
    this.targetOffsetX = 0;
    this.targetOffsetY = 0;
    this.targetScale = 1;

    // Parallax mouse tilt
    this.mouseNormX = 0;
    this.mouseNormY = 0;
    this.cursorHitPoint = new THREE.Vector3(999, 999, 999);
    this.hasCursorIntersection = false;

    // Color palettes (Default warm ivory theme)
    this.colorContinent = new THREE.Color(0x2d3139); // Charcoal ink
    this.colorOcean = new THREE.Color(0xb8b0a2);     // Soft warm taupe
    this.colorAccent = new THREE.Color(0x7c3aed);    // Dynamic accent

    this.raycaster = new THREE.Raycaster();
    this.mouseVector = new THREE.Vector2(-999, -999);
    this.hitSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), this.sphereRadius);
    this.lastFrameTime = performance.now();

    this.init();
  }

  init() {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.z = 9.5;

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: !this.isLowPower,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Build Point-Cloud Globe
    this.createPointSphere();

    // 4. Bind Events
    this.bindEvents();

    // 5. Start Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  createPointSphere() {
    const count = this.particleCount;
    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(count * 3);
    this.basePositions = new Float32Array(count * 3);
    this.currentPositions = new Float32Array(count * 3);
    this.sizes = new Float32Array(count);
    this.colors = new Float32Array(count * 3);
    this.isContinent = new Uint8Array(count);

    const phi = Math.PI * (Math.sqrt(5) - 1); // Golden ratio angle

    // Convert sector lat/lons to unit direction vectors for continent clustering
    const sectorVectors = (this.options.sectors || []).map(s => {
      const latRad = (s.globeCoords.lat * Math.PI) / 180;
      const lonRad = (s.globeCoords.lon * Math.PI) / 180;
      return {
        id: s.id,
        vec: new THREE.Vector3(
          Math.cos(latRad) * Math.sin(lonRad),
          Math.sin(latRad),
          Math.cos(latRad) * Math.cos(lonRad)
        )
      };
    });

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const unitVec = new THREE.Vector3(x, y, z).normalize();
      
      // Determine if near any continent cluster
      let isLand = false;
      let minDistance = 999;
      for (const sVec of sectorVectors) {
        const dist = unitVec.distanceTo(sVec.vec);
        if (dist < minDistance) minDistance = dist;
        // Continent cluster radius
        if (dist < 0.68) {
          isLand = true;
        }
      }

      // Add pseudo-organic archipelago noise
      const noise = (Math.sin(x * 6) + Math.cos(y * 6) + Math.sin(z * 6)) * 0.15;
      if (minDistance < 0.85 + noise && Math.random() > 0.35) {
        isLand = true;
      }

      // Actual 3D coordinates
      const px = unitVec.x * this.sphereRadius;
      const py = unitVec.y * this.sphereRadius;
      const pz = unitVec.z * this.sphereRadius;

      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;

      this.basePositions[i * 3] = px;
      this.basePositions[i * 3 + 1] = py;
      this.basePositions[i * 3 + 2] = pz;

      this.currentPositions[i * 3] = px;
      this.currentPositions[i * 3 + 1] = py;
      this.currentPositions[i * 3 + 2] = pz;

      this.isContinent[i] = isLand ? 1 : 0;

      // Particle styling: Continents have textured varied dot sizes
      if (isLand) {
        this.sizes[i] = (Math.random() * 2.2 + 2.0) * (this.isMobile ? 1.4 : 1.0);
        this.colors[i * 3] = this.colorContinent.r;
        this.colors[i * 3 + 1] = this.colorContinent.g;
        this.colors[i * 3 + 2] = this.colorContinent.b;
      } else {
        this.sizes[i] = (Math.random() * 0.8 + 1.1) * (this.isMobile ? 1.3 : 1.0);
        this.colors[i * 3] = this.colorOcean.r;
        this.colors[i * 3 + 1] = this.colorOcean.g;
        this.colors[i * 3 + 2] = this.colorOcean.b;
      }
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.currentPositions, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    // Custom circular particle texture shader-like material
    const particleTexture = this.generateDotTexture();

    this.material = new THREE.PointsMaterial({
      size: 1.0,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.95,
      alphaTest: 0.05,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.particles);
  }

  generateDotTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 64, 64);
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());

    // Mouse movement for Parallax & Gravity Dimple
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseNormX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseNormY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      this.mouseVector.x = this.mouseNormX;
      this.mouseVector.y = this.mouseNormY;

      // Project onto sphere in 3D
      if (!this.isLowPower && this.camera) {
        this.raycaster.setFromCamera(this.mouseVector, this.camera);
        const ray = this.raycaster.ray;
        
        // Ray-sphere intersection with current transformed globe
        const sphereCenter = this.particles.position.clone();
        const testSphere = new THREE.Sphere(sphereCenter, this.sphereRadius * this.currentScale);
        const target = new THREE.Vector3();
        const hit = ray.intersectSphere(testSphere, target);

        if (hit) {
          // Convert hit point to local particle space
          const localHit = target.clone().sub(sphereCenter);
          // Reverse sphere rotation
          const invEuler = new THREE.Euler(-this.particles.rotation.x, -this.particles.rotation.y, 0, 'YXZ');
          localHit.applyEuler(invEuler);
          localHit.divideScalar(this.currentScale);

          this.cursorHitPoint.copy(localHit);
          this.hasCursorIntersection = true;
        } else {
          this.hasCursorIntersection = false;
        }
      }
    });

    window.addEventListener('mouseleave', () => {
      this.hasCursorIntersection = false;
      this.mouseNormX = 0;
      this.mouseNormY = 0;
    });
  }

  onResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    this.isMobile = window.innerWidth <= 768;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  /**
   * Set target rotation coordinates based on sector Lat/Lon
   */
  rotateTo(lat, lon, immediate = false) {
    this.isResting = false;
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;

    // Target rotation to bring lat/lon directly facing camera (Z+)
    this.targetRotX = latRad;
    this.targetRotY = -lonRad + Math.PI / 2;

    if (immediate) {
      this.currentRotX = this.targetRotX;
      this.currentRotY = this.targetRotY;
    }
  }

  /**
   * Return to central resting auto-spin
   */
  resetToResting() {
    this.isResting = true;
    this.targetRotX = 0.15;
    this.setStageOffset(0, 0, 1.0);
  }

  /**
   * Set 3D staging offset and scale (driven by choreographer)
   */
  setStageOffset(offsetX, offsetY, scale = 1.0) {
    // Normalize px offset to 3D world space
    const factorX = (offsetX / window.innerWidth) * 7.5;
    const factorY = -(offsetY / window.innerHeight) * 5.0;

    this.targetOffsetX = factorX;
    this.targetOffsetY = factorY;
    this.targetScale = scale;
  }

  /**
   * Update particle colors on sector change (tonal drift)
   */
  setSectorAccent(dotAccentHex) {
    if (!dotAccentHex) return;
    this.colorAccent.set(dotAccentHex);

    const colors = this.geometry.attributes.color.array;
    for (let i = 0; i < this.particleCount; i++) {
      if (this.isContinent[i]) {
        // Blend continent dots with slight accent tint
        colors[i * 3] = this.colorContinent.r * 0.7 + this.colorAccent.r * 0.3;
        colors[i * 3 + 1] = this.colorContinent.g * 0.7 + this.colorAccent.g * 0.3;
        colors[i * 3 + 2] = this.colorContinent.b * 0.7 + this.colorAccent.b * 0.3;
      }
    }
    this.geometry.attributes.color.needsUpdate = true;
  }

  animate() {
    requestAnimationFrame(this.animate);

    const now = performance.now();
    const delta = Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;

    // 1. Auto-rotation or smooth tween to target coordinates
    if (this.isResting) {
      this.targetRotY += this.autoRotateSpeed;
    }

    // Lerp Rotations
    const rotLerp = 0.05;
    this.currentRotY += (this.targetRotY - this.currentRotY) * rotLerp;
    this.currentRotX += (this.targetRotX - this.currentRotX) * rotLerp;

    // Parallax tilt (subtle 3.5° addition)
    const parallaxX = this.mouseNormY * 0.06;
    const parallaxY = this.mouseNormX * 0.08;

    this.particles.rotation.x = this.currentRotX + parallaxX;
    this.particles.rotation.y = this.currentRotY + parallaxY;

    // 2. Lerp Staging Offset & Scale
    const stageLerp = 0.06;
    this.currentOffsetX += (this.targetOffsetX - this.currentOffsetX) * stageLerp;
    this.currentOffsetY += (this.targetOffsetY - this.currentOffsetY) * stageLerp;
    this.currentScale += (this.targetScale - this.currentScale) * stageLerp;

    this.particles.position.x = this.currentOffsetX;
    this.particles.position.y = this.currentOffsetY;
    this.particles.scale.set(this.currentScale, this.currentScale, this.currentScale);

    // 3. Cursor Gravity Dimple Physics (Per-frame BufferGeometry update)
    if (!this.isLowPower && this.geometry) {
      const positions = this.geometry.attributes.position.array;
      const count = this.particleCount;
      const dimpleRadius = 1.4;
      const maxDent = 0.85; // Radial inward pull depth

      let needsPosUpdate = false;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const bx = this.basePositions[i3];
        const by = this.basePositions[i3 + 1];
        const bz = this.basePositions[i3 + 2];

        let tx = bx;
        let ty = by;
        let tz = bz;

        if (this.hasCursorIntersection) {
          const dx = bx - this.cursorHitPoint.x;
          const dy = by - this.cursorHitPoint.y;
          const dz = bz - this.cursorHitPoint.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < dimpleRadius) {
            const factor = Math.pow(1 - dist / dimpleRadius, 2) * maxDent;
            // Pull toward center (0,0,0)
            tx = bx * (1 - factor);
            ty = by * (1 - factor);
            tz = bz * (1 - factor);
          }
        }

        // Spring elastic lerp back to base/target
        const curX = positions[i3];
        const curY = positions[i3 + 1];
        const curZ = positions[i3 + 2];

        const nextX = curX + (tx - curX) * 0.12;
        const nextY = curY + (ty - curY) * 0.12;
        const nextZ = curZ + (tz - curZ) * 0.12;

        if (Math.abs(nextX - curX) > 0.0001 || Math.abs(nextY - curY) > 0.0001 || Math.abs(nextZ - curZ) > 0.0001) {
          positions[i3] = nextX;
          positions[i3 + 1] = nextY;
          positions[i3 + 2] = nextZ;
          needsPosUpdate = true;
        }
      }

      if (needsPosUpdate) {
        this.geometry.attributes.position.needsUpdate = true;
      }
    }

    // 4. Broadcast live facing coordinates to HUD
    if (this.options.onCoordinateUpdate) {
      const lat = (this.particles.rotation.x * 180) / Math.PI;
      const lon = ((-this.particles.rotation.y + Math.PI / 2) * 180) / Math.PI;
      
      const normLat = ((((lat % 360) + 540) % 360) - 180);
      const normLon = ((((lon % 360) + 540) % 360) - 180);

      const latStr = `${Math.abs(normLat).toFixed(1)}°${normLat >= 0 ? 'N' : 'S'}`;
      const lonStr = `${Math.abs(normLon).toFixed(1)}°${normLon >= 0 ? 'E' : 'W'}`;

      this.options.onCoordinateUpdate(`LAT ${latStr} · LON ${lonStr}`);
    }

    // 5. Render
    this.renderer.render(this.scene, this.camera);
  }
}
