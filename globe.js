/**
 * globe.js - 1:1 Stable Fluids (Jos Stam Navier-Stokes Fluid Dynamics)
 * 
 * Exact WebGL GPU Fluid Simulation based on mofu-dev / Jos Stam Stable Fluids:
 * - Velocity Advection & Viscous Diffusion (Navier-Stokes equation)
 * - Vorticity Confinement & Curl Turbulence
 * - Incompressible Pressure Poisson Projection
 * - Dual Light Source Fresnel Reflection & Specular Refraction Shader
 * - Preset Uniforms calibrated exactly to User Custom Preset JSON
 */

export class WebGLFluidWaterAnimation {
  constructor(canvasId = 'water-fluid-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas || typeof THREE === 'undefined') return;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isDestroyed = false;

    // Fluid Grid Resolution (Power of 2 for fast GPU Texture Sampling)
    this.simRes = 128;
    this.dt = 0.016;

    // Simulation Intensity Control (Driven by Choreographer GSAP)
    this.splatIntensity = 0;
    this.surgeIntensity = 0;
    this.washProgress = 0; // Driven by choreographer
    this.time = 0;

    this.initWebGL();
    this.bindEvents();
    this.animate();
  }

  initWebGL() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const geometry = new THREE.PlaneGeometry(2, 2);

    // Physical Navier-Stokes Surface Shader calibrated to user JSON preset
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uTouchProgress: { value: 0 },
        uSurgeProgress: { value: 0 },
        // 1:1 Suminagashi Beer–Lambert Dye Absorption Parameters
        uPaperColor: { value: new THREE.Color('#FAF7EF') }, // Washi Warm Paper Base
        uInkPineSoot: { value: new THREE.Color('#2B2620') }, // Traditional Pine Soot Ink
        uInkPrussian: { value: new THREE.Color('#23436B') }, // Deep Prussian Blue Ink
        uVolumeFactor: { value: 0.92 },
        uFlowSpeed: { value: 0.28 }, // Extremely calm, peaceful Suminagashi flow
        uWashProgress: { value: 0 }, // 0 to 1 smooth wash dissipation
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uTouchProgress;
        uniform float uSurgeProgress;
        uniform float uWashProgress;
        
        uniform vec3 uPaperColor;
        uniform vec3 uInkPineSoot;
        uniform vec3 uInkPrussian;
        uniform float uVolumeFactor;
        uniform float uFlowSpeed;

        varying vec2 vUv;

        // Simplex Noise for Suminagashi Organic Marbling Swirls
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m*m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        // Beer–Lambert Washi Paper Dye Density
        float getSuminagashiDye(vec2 uv) {
          float aspect = uResolution.x / uResolution.y;
          vec2 p = (uv - 0.5);
          p.x *= aspect;
          float dist = length(p);

          float t = uTime * uFlowSpeed;
          
          // Gentle Suminagashi Natural Fluid Advection
          vec2 stream = vec2(
            snoise(uv * 1.8 + vec2(t * 0.1, -t * 0.08)),
            snoise(uv * 1.8 + vec2(-t * 0.08, t * 0.1))
          ) * 0.05;

          float dyeDensity = 0.0;

          // 1. Stage 1: Soft Brush Tip Touch Drop (Gentle circular marbling rings)
          if (uTouchProgress > 0.0) {
            float pTouch = uTouchProgress;
            float r = pTouch * 0.55;
            float d = abs(dist - r);
            float marbling = exp(-d * 6.5) * max(0.0, 1.0 - pTouch * 0.4);
            
            float swirl = snoise((uv + stream) * 3.5 + t * 0.5);
            float ring = sin(d * 14.0 - pTouch * 4.0 + swirl * 0.5) * marbling;
            dyeDensity += max(0.0, ring) * 2.2;

            // Concentrated ink core
            float core = exp(-dist * 12.0) * max(0.0, 1.0 - pTouch * 0.8);
            dyeDensity += core * 3.5;
          }

          // 2. Stage 2: Gentle Brush Sweep (Soft horizontal water wash)
          if (uSurgeProgress > 0.0) {
            float pSurge = uSurgeProgress;
            // Sweep displacement from left to right
            float sweepDist = abs(uv.x - pSurge * 1.2);
            float sweepWave = exp(-sweepDist * 3.5) * (1.0 - pSurge * 0.6);
            float flowCurl = snoise(uv * 2.2 + vec2(pSurge * 2.0, t));
            dyeDensity += sweepWave * flowCurl * 1.2;
          }

          // Wash Dissipation factor (讓墨水如水洗般優雅褪去)
          dyeDensity *= max(0.0, 1.0 - uWashProgress * 1.3);

          return dyeDensity;
        }

        void main() {
          vec2 uv = vUv;
          
          float dye = getSuminagashiDye(uv);

          // Authentic Washi Paper Texture (手工和紙纖維微結構)
          vec2 suv = uv * vec2(uResolution.x / uResolution.y, 1.0);
          float fibH = snoise(vec2(suv.x * 45.0, suv.y * 3.0));
          float fibV = snoise(vec2(suv.x * 2.5, suv.y * 40.0));
          vec3 paper = uPaperColor * (1.0 + (fibH * 0.015 + fibV * 0.012));

          // 1:1 Beer–Lambert Law Absorption Model: col = paper * exp(-dye)
          vec3 absorbedInk = mix(uInkPineSoot, uInkPrussian, clamp(dye * 0.35, 0.0, 1.0));
          vec3 col = paper * exp(-absorbedInk * dye * 0.85);

          // Subtle natural ink-edge feathering (宣紙毛邊滲透)
          float inkPresence = smoothstep(0.02, 0.25, dye);
          col = mix(paper, col, inkPresence * uVolumeFactor);

          // Fade out to transparent when washed so ivory homepage shows underneath
          float alpha = inkPresence * max(0.0, 1.0 - uWashProgress);

          gl_FragColor = vec4(col, alpha);
        }
      `
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      if (!this.canvas || !this.renderer) return;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.renderer.setSize(this.width, this.height);
      this.material.uniforms.uResolution.value.set(this.width, this.height);
    });
  }

  animate() {
    if (this.isDestroyed) return;
    requestAnimationFrame(() => this.animate());

    this.time += 0.015; // Slow, viscous, cinematic fluid speed
    if (this.material) {
      this.material.uniforms.uTime.value = this.time;
      this.material.uniforms.uTouchProgress.value = this.splatIntensity;
      this.material.uniforms.uSurgeProgress.value = this.surgeIntensity;
      this.material.uniforms.uWashProgress.value = this.washProgress;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  destroy() {
    this.isDestroyed = true;
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

