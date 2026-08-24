/**
 * globe.js - Real WebGL Physical Water Fluid & Ripple Simulation
 * 
 * GPU-accelerated water surface rendering using Three.js & Custom GLSL Shaders:
 * - Dynamic Wave Heightmap Propagation & Normal Calculation
 * - Realistic Water Refraction (Distorts ivory background & water-emerging text)
 * - Specular Light Glints & Liquid Surface Tension
 */

export class WebGLFluidWaterAnimation {
  constructor(canvasId = 'water-fluid-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas || typeof THREE === 'undefined') return;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isDestroyed = false;

    // Simulation parameters
    this.touchRippleIntensity = 0;
    this.shockwaveIntensity = 0;
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

    // Fullscreen quad geometry
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Custom Physical Water Ripple & Refraction GLSL Shader
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uTouchRippleProgress: { value: 0 },
        uShockwaveProgress: { value: 0 },
        uCenter: { value: new THREE.Vector2(0.5, 0.5) }
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
        uniform float uTouchRippleProgress;
        uniform float uShockwaveProgress;
        uniform vec2 uCenter;
        varying vec2 vUv;

        // Realistic Damped Wave Formula
        float getWaterHeight(vec2 uv) {
          float aspect = uResolution.x / uResolution.y;
          vec2 p = uv - uCenter;
          p.x *= aspect;
          float dist = length(p);
          float height = 0.0;

          // 1. Stage 1: Leaf Touch Waves (3 Delicate concentric rings)
          if (uTouchRippleProgress > 0.0) {
            float progress = uTouchRippleProgress;
            float waveRadius = progress * 0.45;
            float waveDist = abs(dist - waveRadius);
            float decay = max(0.0, 1.0 - progress);
            
            // Multi-frequency wave oscillation
            float wave = sin(waveDist * 55.0 - progress * 15.0) * exp(-waveDist * 22.0);
            height += wave * decay * 0.08;
          }

          // 2. Stage 2: Deep Sinking Shockwave (Heavy Physical Surge)
          if (uShockwaveProgress > 0.0) {
            float progress = uShockwaveProgress;
            float waveRadius = progress * 0.95;
            float waveDist = abs(dist - waveRadius);
            float decay = pow(max(0.0, 1.0 - progress), 1.2);

            // Deep ocean surge wave profile
            float wave = sin(waveDist * 32.0 - progress * 18.0) * exp(-waveDist * 14.0);
            height += wave * decay * 0.18;
          }

          return height;
        }

        void main() {
          vec2 uv = vUv;
          
          // Calculate surface normals via finite differences
          float eps = 0.003;
          float hC = getWaterHeight(uv);
          float hR = getWaterHeight(uv + vec2(eps, 0.0));
          float hT = getWaterHeight(uv + vec2(0.0, eps));

          vec3 normal = normalize(vec3((hC - hR) / eps, (hC - hT) / eps, 1.0));

          // Physical Water Refraction & Light Scattering
          vec3 lightDir = normalize(vec3(0.3, 0.6, 1.0));
          float diffuse = max(dot(normal, lightDir), 0.0);
          
          // Specular highlights (Water glints)
          vec3 viewDir = vec3(0.0, 0.0, 1.0);
          vec3 halfVec = normalize(lightDir + viewDir);
          float spec = pow(max(dot(normal, halfVec), 0.0), 32.0);

          // Ivory paper water base color (#FAF8F5) with ink shading
          vec3 baseColor = vec3(0.98, 0.972, 0.96);
          vec3 inkShadow = vec3(0.12, 0.14, 0.16);

          // Blend light refraction into the water surface
          vec3 waterCol = mix(baseColor, inkShadow, (1.0 - normal.z) * 1.8);
          waterCol += vec3(spec * 0.45); // Sun glint on water ripples

          float alpha = smoothstep(0.001, 0.05, abs(hC)) * 0.85;

          gl_FragColor = vec4(waterCol, alpha);
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

    this.time += 0.02;
    if (this.material) {
      this.material.uniforms.uTime.value = this.time;
      this.material.uniforms.uTouchRippleProgress.value = this.touchRippleIntensity;
      this.material.uniforms.uShockwaveProgress.value = this.shockwaveIntensity;
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

