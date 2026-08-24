/**
 * globe.js - 1:1 Raw WebGL Navier-Stokes Multi-Pass FBO Fluid Simulation (Suminagashi Engine)
 * 
 * Directly executes real Navier-Stokes Ping-Pong Framebuffer fluid dynamics:
 * - Ping-Pong Double FBO Advection (Velocity & Dye)
 * - Curl, Vorticity Confinement & Poisson Pressure Solving
 * - Beer–Lambert Liquid Dye Dynamics (Clean Transparent Paper Base)
 * - True Fluid Waves & Physics Dispersion
 */

export class WebGLFluidWaterAnimation {
  constructor(canvasId = 'water-fluid-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.isDestroyed = false;
    this.splatIntensity = 0;
    this.surgeIntensity = 0;
    this.washProgress = 0;
    this.drops = [];
    this.pointers = new Map();

    this.initEngine();
  }

  absorb(hex) {
    const c = [1, 3, 5].map(i => Math.max(parseInt(hex.slice(i, i + 2), 16) / 255, 0.018));
    return c.map(v => -Math.log(v));
  }

  initEngine() {
    const config = {
      SIM_RES: 160,
      DYE_RES: 1024,
      DENSITY_DISSIPATION: 0.012,
      VELOCITY_DISSIPATION: 1.15,
      PRESSURE: 0.85,
      PRESSURE_ITER: 22,
      CURL: 10.5,
      SPLAT_FORCE: 6800,
      WASH_DISSIPATION: 1.8,
    };
    this.config = config;

    this.INKS = [
      this.absorb("#2b2620"), // 墨
      this.absorb("#23436b"), // 紺
      this.absorb("#bd3a2a"), // 朱
      this.absorb("#42603f")  // 松葉
    ];

    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let gl = this.canvas.getContext("webgl2", params);
    this.isWebGL2 = !!gl;
    if (!gl) gl = this.canvas.getContext("webgl", params) || this.canvas.getContext("experimental-webgl", params);
    this.gl = gl;

    if (!gl) {
      console.warn("WebGL not supported.");
      return;
    }

    if (this.isWebGL2) {
      gl.getExtension("EXT_color_buffer_float");
      this.supportLinear = !!gl.getExtension("OES_texture_float_linear") || !!gl.getExtension("OES_texture_half_float_linear");
      this.halfFloatType = gl.HALF_FLOAT;
    } else {
      const hf = gl.getExtension("OES_texture_half_float");
      this.supportLinear = !!gl.getExtension("OES_texture_half_float_linear");
      this.halfFloatType = hf ? hf.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
    }

    this.initFormats();
    this.initShaders();
    this.initGeometry();
    this.resizeCanvas();
    this.initFramebuffers();
    this.bindEvents();

    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  supportRenderTexture(internalFormat, format, type) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.deleteTexture(tex);
    gl.deleteFramebuffer(fbo);
    return ok;
  }

  pickFormat(internalFormat, format, type) {
    const gl = this.gl;
    if (this.supportRenderTexture(internalFormat, format, type)) return { internalFormat, format };
    if (this.isWebGL2) {
      if (internalFormat === gl.R16F && this.supportRenderTexture(gl.RG16F, gl.RG, type)) return { internalFormat: gl.RG16F, format: gl.RG };
      if ((internalFormat === gl.R16F || internalFormat === gl.RG16F) && this.supportRenderTexture(gl.RGBA16F, gl.RGBA, type)) return { internalFormat: gl.RGBA16F, format: gl.RGBA };
    }
    return null;
  }

  initFormats() {
    const gl = this.gl;
    let fmtRGBA, fmtRG, fmtR;
    if (this.isWebGL2) {
      fmtRGBA = this.pickFormat(gl.RGBA16F, gl.RGBA, this.halfFloatType);
      fmtRG = this.pickFormat(gl.RG16F, gl.RG, this.halfFloatType);
      fmtR = this.pickFormat(gl.R16F, gl.RED, this.halfFloatType);
    }
    if (!fmtRGBA) {
      fmtRGBA = this.supportRenderTexture(gl.RGBA, gl.RGBA, this.halfFloatType) ? { internalFormat: gl.RGBA, format: gl.RGBA } : (this.halfFloatType = gl.UNSIGNED_BYTE, { internalFormat: gl.RGBA, format: gl.RGBA });
      fmtRG = fmtRGBA;
      fmtR = fmtRGBA;
    } else {
      if (!fmtRG) fmtRG = fmtRGBA;
      if (!fmtR) fmtR = fmtRG;
    }
    this.fmtRGBA = fmtRGBA;
    this.fmtRG = fmtRG;
    this.fmtR = fmtR;
  }

  compile(type, src, keywords) {
    const gl = this.gl;
    if (keywords) src = keywords.map(k => "#define " + k + "\n").join("") + src;
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh));
    return sh;
  }

  createProgram(vs, fsSrc, keywords) {
    const gl = this.gl;
    const fs = this.compile(gl.FRAGMENT_SHADER, fsSrc, keywords);
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, "aPosition");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(p));
    const uniforms = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const name = gl.getActiveUniform(p, i).name;
      uniforms[name] = gl.getUniformLocation(p, name);
    }
    return {
      program: p,
      uniforms,
      bind() {
        gl.useProgram(p);
      }
    };
  }

  initShaders() {
    const VERT = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const FRAG_COPY = `
      precision mediump float;
      precision mediump sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      void main () {
        gl_FragColor = texture2D(uTexture, vUv);
      }
    `;

    const FRAG_CLEAR = `
      precision mediump float;
      precision mediump sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `;

    const FRAG_SPLAT = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      uniform float clampMax;
      void main () {
        vec2 p = vUv - point;
        p.x *= aspectRatio;
        float s = exp(-dot(p, p) / radius);
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(min(base + s * color, vec3(clampMax)), 1.0);
      }
    `;

    const FRAG_ADVECT = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;
      uniform float aspectRatio;
      uniform vec2 uSinkCenter;
      uniform float uSinkForce;
      uniform float uSinkSwirl;

      #ifdef MANUAL_FILTERING
      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }
      #endif

      void main () {
        vec2 vel = texture2D(uVelocity, vUv).xy;

        // Pixel-Perfect True-Circular Gravitational Pull into the Period Dot
        // Both distance AND direction are computed in physical (aspect-corrected) space,
        // then the direction is converted back to UV space for the velocity splat.
        if (uSinkForce > 0.001) {
          vec2 toSink = uSinkCenter - vUv;
          // Transform to physical space (square pixels)
          vec2 pPhys = vec2(toSink.x * aspectRatio, toSink.y);
          float dist = length(pPhys);
          if (dist > 0.001) {
            // Direction in physical space
            vec2 dirPhys = pPhys / dist;
            // Convert direction back to UV space (undo aspect stretch on x)
            vec2 dirUV = normalize(vec2(dirPhys.x / aspectRatio, dirPhys.y));
            float pull = uSinkForce / (dist * 3.5 + 0.08);
            vel += dirUV * pull * 450.0;
          }
        }

        #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * (bilerp(uVelocity, vUv, texelSize).xy + vel * 0.1) * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
        #else
        vec2 coord = vUv - dt * vel * texelSize;
        vec4 result = texture2D(uSource, coord);
        #endif

        // Shrink & vanish dye cleanly as it touches the dot center
        if (uSinkForce > 0.001) {
          vec2 pSink = (uSinkCenter - vUv);
          pSink.x *= aspectRatio;
          float dSink = length(pSink);
          result *= smoothstep(0.005, 0.04 + uSinkForce * 0.18, dSink);
        }

        gl_FragColor = result / (1.0 + dissipation * dt);
      }
    `;

    const FRAG_DIVERGENCE = `
      precision mediump float;
      precision mediump sampler2D;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) L = -C.x;
        if (vR.x > 1.0) R = -C.x;
        if (vT.y > 1.0) T = -C.y;
        if (vB.y < 0.0) B = -C.y;
        gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
      }
    `;

    const FRAG_CURL = `
      precision mediump float;
      precision mediump sampler2D;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        gl_FragColor = vec4(R - L - T + B, 0.0, 0.0, 1.0);
      }
    `;

    const FRAG_VORTICITY = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;
      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 vel = texture2D(uVelocity, vUv).xy;
        vel += force * dt;
        vel = clamp(vel, vec2(-1000.0), vec2(1000.0));
        gl_FragColor = vec4(vel, 0.0, 1.0);
      }
    `;

    const FRAG_PRESSURE = `
      precision mediump float;
      precision mediump sampler2D;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float divergence = texture2D(uDivergence, vUv).x;
        gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
      }
    `;

    const FRAG_GRADIENT = `
      precision mediump float;
      precision mediump sampler2D;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 vel = texture2D(uVelocity, vUv).xy;
        vel -= vec2(R - L, T - B);
        gl_FragColor = vec4(vel, 0.0, 1.0);
      }
    `;

    // Master Hybrid Shader: Authentic Navier-Stokes Fluid + In-Shader Text Mask Inversion + Noir Accretion Disk
    const FRAG_DISPLAY = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uDye;
      uniform sampler2D uVelocity;
      uniform sampler2D uText;
      uniform vec2 uAspect;
      uniform vec2 uRes;
      uniform float uWash;
      uniform float uTime;
      uniform float aspectRatio;
      uniform vec2 uSinkCenter;
      uniform float uSinkForce;
      uniform float uTextOpacity;

      float rand(vec2 n){return fract(sin(dot(n,vec2(12.9898,4.1414)))*43758.5453);}
      
      float noise(vec2 p){
        vec2 ip=floor(p);
        vec2 u=fract(p);
        u=u*u*(3.0-2.0*u);
        float res=mix(mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
        return res*res;
      }
      
      float fbm(vec2 p, float timeOffset) {
        float total=0.0;
        float amplitude=0.65;
        for(int i=0;i<4;i++){
          float timeScale=0.6+0.15*float(i);
          float noiseVal = noise(p*2.0+vec2(timeOffset*timeScale*0.5,timeOffset*timeScale*0.35));
          total+=amplitude*noiseVal;
          p+=vec2(noiseVal*0.2,-noiseVal*0.15);
          p*=2.1;
          amplitude*=0.5;
        }
        return total;
      }

      void main () {
        vec2 uv = vUv;
        vec2 eps = vec2(1.0 / uRes.x, 1.0 / uRes.y) * 2.0;

        // Sample Dye & Velocity
        vec3 d = texture2D(uDye, uv).rgb;
        float hC = (d.r + d.g + d.b) * 0.333;
        float hR = (texture2D(uDye, uv + vec2(eps.x, 0.0)).r + texture2D(uDye, uv + vec2(eps.x, 0.0)).g + texture2D(uDye, uv + vec2(eps.x, 0.0)).b) * 0.333;
        float hT = (texture2D(uDye, uv + vec2(0.0, eps.y)).r + texture2D(uDye, uv + vec2(0.0, eps.y)).g + texture2D(uDye, uv + vec2(0.0, eps.y)).b) * 0.333;

        // 3D Liquid Surface Normal Calculation with High-Gloss Surface Tension
        vec3 normal = normalize(vec3((hC - hR) * 26.0, (hC - hT) * 26.0, 1.0));
        vec3 viewDir = vec3(0.0, 0.0, 1.0);

        // Two-Stage Early Light Retraction
        float lightRetract = pow(clamp(1.0 - uWash * 2.2, 0.0, 1.0), 2.5);

        // 1. Dual Light Sources Blinn-Phong Specular Glints (Rich Liquid Glaze)
        vec3 l1 = normalize(vec3(0.7, 0.7, 0.4));
        vec3 h1 = normalize(l1 + viewDir);
        float spec1 = pow(max(dot(normal, h1), 0.0), 230.0);

        vec3 l2 = normalize(vec3(0.3, 0.3, 0.6));
        vec3 h2 = normalize(l2 + viewDir);
        float spec2 = pow(max(dot(normal, h2), 0.0), 140.0);

        vec3 specular = (vec3(0.96, 0.97, 1.0) * spec1 * 0.82 + vec3(0.75, 0.76, 0.84) * spec2 * 0.42) * lightRetract;

        // 2. Fresnel Grazing Liquid Water Sheen (強烈水感反光邊緣)
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.1);
        vec3 fresnelSheen = mix(vec3(0.96, 0.95, 0.93), vec3(0.85, 0.89, 0.96), fresnel);

        // 3. Beer–Lambert Deep Dye Absorption
        vec3 paper = vec3(0.98, 0.972, 0.96); // Warm Ivory Canvas
        vec3 inkCol = paper * exp(-d);
        
        // Deepen rich charcoal ink tones with rich gradient
        inkCol = mix(inkCol, vec3(0.05, 0.045, 0.045), clamp(hC * 0.85, 0.0, 0.96));

        // 4. Enhanced Rayleigh Atmospheric Volumetric Ink Mist (煙波晨霧瀰漫 · 溫潤朦朧意境)
        float mistIntensity = smoothstep(0.015, 0.50, hC) * (1.0 - smoothstep(0.35, 0.90, hC));
        vec3 mistColor = vec3(0.97, 0.965, 0.955);
        inkCol = mix(inkCol, mistColor, mistIntensity * 0.75 * lightRetract);

        // Blend in glossy Fresnel liquid sheen
        inkCol = mix(inkCol, fresnelSheen, fresnel * 0.45 * lightRetract);

        // Rich specular highlight strictly tied to active liquid ink bodies
        float inkAmount = clamp(hC * 1.8, 0.0, 1.0);
        inkCol += specular * smoothstep(0.04, 0.30, inkAmount);

        float alpha = smoothstep(0.01, 0.12, inkAmount) * (1.0 - uWash);

        // 5. IN-SHADER DYNAMIC PHYSICAL TEXT MASK INVERSION (方案一：GPU 像素級即時反相)
        float textAlpha = texture2D(uText, uv).a * uTextOpacity;
        if (textAlpha > 0.01) {
          // Over dark ink: Inverts to brilliant pure ivory white (#FAF8F5)
          // Over clean paper: Inverts to deep rich black (#121316)
          vec3 invertedTextCol = mix(vec3(0.12, 0.11, 0.11), vec3(0.98, 0.97, 0.95), clamp(inkAmount * 1.4, 0.0, 1.0));
          inkCol = mix(inkCol, invertedTextCol, textAlpha * (1.0 - uWash * 0.8));
          alpha = max(alpha, textAlpha * (1.0 - uWash));
        }

        // 6. NOIR MICRO BLACK HOLE ACCRETION DISK (3D Inclined along y = x diagonal / 45° angle)
        if (uSinkForce > 0.01) {
          vec2 toCenter = (uv - uSinkCenter);
          toCenter.x *= aspectRatio;

          // 3D Tilt Matrix aligned with y = x diagonal (45° rotation + 2.2x perpendicular pitch foreshortening)
          float cos45 = 0.7071068;
          float sin45 = 0.7071068;
          vec2 tiltedP = vec2(
            toCenter.x * cos45 + toCenter.y * sin45,
            (-toCenter.x * sin45 + toCenter.y * cos45) * 2.2
          );
          
          float r = length(tiltedP);
          
          // Scaled to a refined compact size: Disk outer radius ~ 0.048
          float diskOuter = 0.048 * clamp(uSinkForce * 1.3, 0.0, 1.0);
          float diskInner = diskOuter * 0.22; // Event horizon radius
          
          if (r < diskOuter) {
            float normR = clamp((r - diskInner) / (diskOuter - diskInner), 0.0, 1.0);
            float angle = atan(tiltedP.y, tiltedP.x);
            
            // Accretion disk orbital velocity & rotation
            float rotSpeed = 3.5 / (pow(r * 40.0, 1.2) + 0.8);
            float rotAngle = angle - uTime * rotSpeed * 2.8;
            vec2 diskCoord = vec2(r * 28.0, rotAngle * 2.5);
            
            float fbmPattern = fbm(diskCoord, uTime * 0.45);
            
            // Spiral vortex arm
            float spiral = sin(rotAngle * 2.0 + r * 140.0 - uTime * 5.0);
            float arm = smoothstep(-0.3, 0.7, spiral) * 0.4;
            float totalPattern = fbmPattern * 0.7 + arm;

            // Radiant White Photon Disk during suction
            vec3 colorHot = vec3(1.0, 1.0, 1.0);
            vec3 colorMid = vec3(0.85, 0.86, 0.90);
            vec3 colorDeep = vec3(0.15, 0.15, 0.18);

            vec3 diskColor = mix(colorHot, colorMid, smoothstep(0.0, 0.45, normR));
            diskColor = mix(diskColor, colorDeep, smoothstep(0.45, 1.0, normR));
            diskColor *= (totalPattern + 0.5) * 1.6;

            // Brilliant White Photon Ring Lensing Ring
            float photonRing = exp(-pow((normR - 0.08) * 16.0, 2.0)) * 2.2;
            diskColor += vec3(1.0, 1.0, 1.0) * photonRing;

            // Disk alpha mask
            float diskAlpha = smoothstep(0.0, 0.06, normR) * (1.0 - smoothstep(0.82, 1.0, normR));
            diskAlpha *= clamp(uSinkForce * 1.5, 0.0, 1.0);

            // Composite Accretion Disk onto Canvas
            inkCol = mix(inkCol, diskColor, diskAlpha);
            alpha = max(alpha, diskAlpha);

            // Event Horizon: Solid Black Core (becomes deep black dot upon collapse)
            if (r < diskInner) {
              float innerMask = 1.0 - smoothstep(diskInner * 0.85, diskInner, r);
              inkCol = mix(inkCol, vec3(0.06, 0.06, 0.07), innerMask * clamp(uSinkForce * 2.0, 0.0, 1.0));
              alpha = max(alpha, innerMask);
            }
          }
        }

        gl_FragColor = vec4(inkCol, alpha);
      }
    `;

    const vs = this.compile(this.gl.VERTEX_SHADER, VERT);
    this.progCopy = this.createProgram(vs, FRAG_COPY);
    this.progClear = this.createProgram(vs, FRAG_CLEAR);
    this.progSplat = this.createProgram(vs, FRAG_SPLAT);
    this.progAdvect = this.createProgram(vs, FRAG_ADVECT, this.supportLinear ? null : ["MANUAL_FILTERING"]);
    this.progDivergence = this.createProgram(vs, FRAG_DIVERGENCE);
    this.progCurl = this.createProgram(vs, FRAG_CURL);
    this.progVorticity = this.createProgram(vs, FRAG_VORTICITY);
    this.progPressure = this.createProgram(vs, FRAG_PRESSURE);
    this.progGradient = this.createProgram(vs, FRAG_GRADIENT);
    this.progDisplay = this.createProgram(vs, FRAG_DISPLAY);
  }

  initGeometry() {
    const gl = this.gl;
    this.quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const quadIdx = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
  }

  blit(target) {
    const gl = this.gl;
    if (target == null) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  createFBO(w, h, fmt, type, filter) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internalFormat, w, h, 0, fmt.format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      texture: tex,
      fbo,
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      attach(id) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        return id;
      }
    };
  }

  createDoubleFBO(w, h, fmt, type, filter) {
    let a = this.createFBO(w, h, fmt, type, filter);
    let b = this.createFBO(w, h, fmt, type, filter);
    return {
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      get read() { return a; },
      set read(v) { a = v; },
      get write() { return b; },
      set write(v) { b = v; },
      swap() {
        const t = a;
        a = b;
        b = t;
      }
    };
  }

  getRes(base) {
    const gl = this.gl;
    let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspect < 1) aspect = 1 / aspect;
    const min = Math.round(base), max = Math.round(base * aspect);
    return gl.drawingBufferWidth > gl.drawingBufferHeight ? { width: max, height: min } : { width: min, height: max };
  }

  initFramebuffers() {
    const filt = this.supportLinear ? this.gl.LINEAR : this.gl.NEAREST;
    const sim = this.getRes(this.config.SIM_RES);
    const dy = this.getRes(Math.min(this.config.DYE_RES, Math.max(this.gl.drawingBufferWidth, this.gl.drawingBufferHeight)));

    this.dye = this.createDoubleFBO(dy.width, dy.height, this.fmtRGBA, this.halfFloatType, filt);
    this.velocity = this.createDoubleFBO(sim.width, sim.height, this.fmtRG, this.halfFloatType, filt);
    this.divergence = this.createFBO(sim.width, sim.height, this.fmtR, this.halfFloatType, this.gl.NEAREST);
    this.curl = this.createFBO(sim.width, sim.height, this.fmtR, this.halfFloatType, this.gl.NEAREST);
    this.pressure = this.createDoubleFBO(sim.width, sim.height, this.fmtR, this.halfFloatType, this.gl.NEAREST);
    this.initTextTexture();
  }

  initTextTexture() {
    const gl = this.gl;
    const textCanvas = document.createElement('canvas');
    const w = this.canvas.width;
    const h = this.canvas.height;
    textCanvas.width = w;
    textCanvas.height = h;
    const ctx = textCanvas.getContext('2d');

    const titleEl = document.getElementById('hero-title-line');
    const dotEl = document.getElementById('hero-title-dot');
    if (titleEl && ctx) {
      const cRect = this.canvas.getBoundingClientRect();
      const tRect = titleEl.getBoundingClientRect();

      const dpr = w / cRect.width;
      const style = window.getComputedStyle(titleEl);
      const fontSize = parseFloat(style.fontSize) * dpr;

      ctx.font = `700 ${fontSize}px "Playfair Display", Georgia, serif`;
      ctx.letterSpacing = '-0.03em';
      ctx.fillStyle = '#FFFFFF';

      // Measure exact Playfair Display font metrics to eliminate line-height half-leading offset
      const metrics = ctx.measureText('Louis');
      const tx = (tRect.left - cRect.left) * dpr;
      const ty = (tRect.top - cRect.top) * dpr;

      // In CSS, text is vertically aligned by font box. Using actual font ascent gives 1:1 baseline placement:
      ctx.textBaseline = 'alphabetic';
      const baselineOffset = (tRect.height * dpr - (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)) * 0.5;
      const exactBaselineY = ty + metrics.actualBoundingBoxAscent + baselineOffset;
      ctx.fillText('Louis', tx, exactBaselineY);

      // Draw period dot at exact DOM dot bounding box
      if (dotEl) {
        const dRect = dotEl.getBoundingClientRect();
        const dx = (dRect.left + dRect.width * 0.5 - cRect.left) * dpr;
        const dy = (dRect.top + dRect.height * 0.5 - cRect.top) * dpr;
        const radius = (dRect.width * 0.5) * dpr;

        ctx.beginPath();
        ctx.arc(dx, dy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (!this.textTexture) {
      this.textTexture = gl.createTexture();
    }
    gl.bindTexture(gl.TEXTURE_2D, this.textTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // Fix Y-inversion
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  }

  resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(this.canvas.clientWidth * dpr);
    const h = Math.floor(this.canvas.clientHeight * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      if (this.dye) this.initFramebuffers();
    }
  }

  correctRadius(r) {
    const aspect = this.canvas.width / this.canvas.height;
    return aspect > 1 ? r * aspect : r;
  }

  splatVelocity(x, y, dx, dy, radius) {
    const gl = this.gl;
    this.progSplat.bind();
    gl.uniform1i(this.progSplat.uniforms.uTarget, this.velocity.read.attach(0));
    gl.uniform1f(this.progSplat.uniforms.aspectRatio, this.canvas.width / this.canvas.height);
    gl.uniform2f(this.progSplat.uniforms.point, x, y);
    gl.uniform3f(this.progSplat.uniforms.color, dx, dy, 0);
    gl.uniform1f(this.progSplat.uniforms.radius, this.correctRadius(radius));
    gl.uniform1f(this.progSplat.uniforms.clampMax, 4000);
    this.blit(this.velocity.write);
    this.velocity.swap();
  }

  splatDye(x, y, ink, amount, radius) {
    const gl = this.gl;
    this.progSplat.bind();
    gl.uniform1i(this.progSplat.uniforms.uTarget, this.dye.read.attach(0));
    gl.uniform1f(this.progSplat.uniforms.aspectRatio, this.canvas.width / this.canvas.height);
    gl.uniform2f(this.progSplat.uniforms.point, x, y);
    gl.uniform3f(this.progSplat.uniforms.color, ink[0] * amount, ink[1] * amount, ink[2] * amount);
    gl.uniform1f(this.progSplat.uniforms.radius, this.correctRadius(radius));
    gl.uniform1f(this.progSplat.uniforms.clampMax, 7.0);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  spawnDrop(x, y, ink, intensity = 1.0) {
    const seedAngle = Math.random() * Math.PI * 2;

    this.drops.push({
      x,
      y,
      ink,
      age: 0,
      dur: 3.4,
      r0: 0.0001,
      r1: 0.0076 * intensity * (0.88 + Math.random() * 0.24), // Graceful 75% natural coverage
      swirl: (Math.random() - 0.5) * 0.6,
      seedAngle
    });

    // 1. Natural Balanced Organic Fluid Dispersion (自然平衡的天然有機水墨流淌)
    const numRays = 24;
    for (let i = 0; i < numRays; i++) {
      const jitter = (Math.random() - 0.5) * 0.35;
      const theta = (i / numRays) * Math.PI * 2 + jitter;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      const speed = 52 * intensity;
      this.splatVelocity(
        x + cosT * 0.008,
        y + sinT * 0.008,
        cosT * speed,
        sinT * speed,
        0.0045
      );
    }
  }

  // 2. Direct Centripetal Inward Sink Pull into Period Dot (直球向心吸水，無任何混亂旋渦)
  triggerCentripetalVortexSink(targetX, targetY, power = 1.0) {
    this.sinkCenter = { x: targetX, y: targetY };
    this.sinkForce = power;
    this.sinkSwirl = 0.0; // 0 swirl = 100% direct linear gravitational suction into the dot

    const numSinkNodes = 16;
    for (let i = 0; i < numSinkNodes; i++) {
      const theta = (i / numSinkNodes) * Math.PI * 2;
      const radius = 0.04 + Math.random() * 0.22;
      const nodeX = targetX + Math.cos(theta) * radius;
      const nodeY = targetY + Math.sin(theta) * radius;

      // Pure direct linear inward velocity towards the dot center
      const inwardVx = -Math.cos(theta) * 6500 * power;
      const inwardVy = -Math.sin(theta) * 6500 * power;

      this.splatVelocity(nodeX, nodeY, inwardVx, inwardVy, 0.012);
    }
  }

  stepDrops(dt) {
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      d.age += dt;
      const t = Math.min(d.age / d.dur, 1);
      const ease = 1 - Math.pow(1 - t, 2.2);
      const r = d.r0 + (d.r1 - d.r0) * ease;
      const amt = (1 - t) * (1 - t) * 2.8 * dt * 5;
      this.splatDye(d.x, d.y, d.ink, amt, r);

      // Gentle fluid gliding
      if (d.age < d.dur * 0.88) {
        const ringRad = 0.015 + ease * 0.052;
        const numPushes = 8;
        for (let p = 0; p < numPushes; p++) {
          const ang = (p / numPushes) * Math.PI * 2 + d.age * d.swirl * 0.4 + (Math.random() - 0.5) * 0.2;
          const cosA = Math.cos(ang);
          const sinA = Math.sin(ang);

          this.splatVelocity(
            d.x + cosA * ringRad,
            d.y + sinA * ringRad,
            cosA * 24 + -sinA * 8 * d.swirl,
            sinA * 24 + cosA * 8 * d.swirl,
            0.0045
          );
        }
      }
      if (t >= 1) this.drops.splice(i, 1);
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    this.canvas.addEventListener('pointermove', e => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      if (this.lastPtr) {
        const dx = (x - this.lastPtr.x) * this.config.SPLAT_FORCE * 0.8;
        const dy = (y - this.lastPtr.y) * this.config.SPLAT_FORCE * 0.8;
        this.splatVelocity(x, y, dx, dy, 0.0025);
        this.splatDye(x, y, this.INKS[1], 0.2, 0.0004);
      }
      this.lastPtr = { x, y };
    });
  }

  stepSimulation(dt) {
    const gl = this.gl;
    gl.disable(gl.BLEND);

    // 1. Curl
    this.progCurl.bind();
    gl.uniform2f(this.progCurl.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.progCurl.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.curl);

    // 2. Vorticity Confinement
    this.progVorticity.bind();
    gl.uniform2f(this.progVorticity.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.progVorticity.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.progVorticity.uniforms.uCurl, this.curl.attach(1));
    gl.uniform1f(this.progVorticity.uniforms.curl, this.config.CURL);
    gl.uniform1f(this.progVorticity.uniforms.dt, dt);
    this.blit(this.velocity.write);
    this.velocity.swap();

    // 3. Divergence
    this.progDivergence.bind();
    gl.uniform2f(this.progDivergence.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.progDivergence.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.divergence);

    // 4. Pressure Clear
    this.progClear.bind();
    gl.uniform1i(this.progClear.uniforms.uTexture, this.pressure.read.attach(0));
    gl.uniform1f(this.progClear.uniforms.value, this.config.PRESSURE);
    this.blit(this.pressure.write);
    this.pressure.swap();

    // 5. Poisson Pressure Iterations
    this.progPressure.bind();
    gl.uniform2f(this.progPressure.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.progPressure.uniforms.uDivergence, this.divergence.attach(0));
    for (let i = 0; i < this.config.PRESSURE_ITER; i++) {
      gl.uniform1i(this.progPressure.uniforms.uPressure, this.pressure.read.attach(1));
      this.blit(this.pressure.write);
      this.pressure.swap();
    }

    // 6. Velocity Gradient Subtraction
    this.progGradient.bind();
    gl.uniform2f(this.progGradient.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.progGradient.uniforms.uPressure, this.pressure.read.attach(0));
    gl.uniform1i(this.progGradient.uniforms.uVelocity, this.velocity.read.attach(1));
    this.blit(this.velocity.write);
    this.velocity.swap();

    // 7. Advection (Velocity & Dye) with Black Hole Sink Pull
    this.progAdvect.bind();
    gl.uniform2f(this.progAdvect.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform2f(this.progAdvect.uniforms.dyeTexelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1f(this.progAdvect.uniforms.aspectRatio, this.canvas.width / this.canvas.height);
    gl.uniform2f(this.progAdvect.uniforms.uSinkCenter, this.sinkCenter ? this.sinkCenter.x : 0.5, this.sinkCenter ? this.sinkCenter.y : 0.5);
    gl.uniform1f(this.progAdvect.uniforms.uSinkForce, this.sinkForce || 0);
    gl.uniform1f(this.progAdvect.uniforms.uSinkSwirl, this.sinkSwirl || 0.0);

    const velId = this.velocity.read.attach(0);
    gl.uniform1i(this.progAdvect.uniforms.uVelocity, velId);
    gl.uniform1i(this.progAdvect.uniforms.uSource, velId);
    gl.uniform1f(this.progAdvect.uniforms.dt, dt);
    gl.uniform1f(this.progAdvect.uniforms.dissipation, this.config.VELOCITY_DISSIPATION);
    this.blit(this.velocity.write);
    this.velocity.swap();

    gl.uniform2f(this.progAdvect.uniforms.dyeTexelSize, this.dye.texelSizeX, this.dye.texelSizeY);
    gl.uniform1i(this.progAdvect.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.progAdvect.uniforms.uSource, this.dye.read.attach(1));
    gl.uniform1f(this.progAdvect.uniforms.dissipation, this.washProgress > 0 ? this.config.WASH_DISSIPATION : this.config.DENSITY_DISSIPATION);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  render() {
    const gl = this.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.progDisplay.bind();
    gl.uniform1i(this.progDisplay.uniforms.uDye, this.dye.read.attach(0));
    
    if (this.textTexture) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.textTexture);
      gl.uniform1i(this.progDisplay.uniforms.uText, 1);
    }

    const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
    const m = Math.min(w, h);
    gl.uniform2f(this.progDisplay.uniforms.uAspect, w / m, h / m);
    gl.uniform2f(this.progDisplay.uniforms.uRes, w, h);
    gl.uniform1f(this.progDisplay.uniforms.uWash, this.washProgress);
    gl.uniform1f(this.progDisplay.uniforms.uTime, performance.now() / 1000);
    gl.uniform1f(this.progDisplay.uniforms.aspectRatio, this.canvas.width / this.canvas.height);
    gl.uniform2f(this.progDisplay.uniforms.uSinkCenter, this.sinkCenter ? this.sinkCenter.x : 0.5, this.sinkCenter ? this.sinkCenter.y : 0.5);
    gl.uniform1f(this.progDisplay.uniforms.uSinkForce, this.sinkForce || 0);
    gl.uniform1f(this.progDisplay.uniforms.uTextOpacity, this.textOpacity !== undefined ? this.textOpacity : 0.0);
    this.blit(null);
  }

  loop() {
    if (this.isDestroyed) return;
    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    dt = Math.min(dt, 1 / 30);
    this.lastTime = now;

    this.resizeCanvas();
    this.stepDrops(dt);
    this.stepSimulation(dt);
    this.render();

    requestAnimationFrame(this.loop);
  }

  destroy() {
    this.isDestroyed = true;
  }
}


