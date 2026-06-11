/**
 * GLSL Shaders for the Arcane Custom Cursor System
 */
export const RunicPlasmaShader = {
  vertexShader: `
    uniform float uTime;
    uniform float uSpeed;
    uniform float uWobble;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    // Simple 3D noise for vertex displacement
    float hash(vec3 p) {
      p = fract(p * 0.3183099 + .1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }

    float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f*f*(3.0-2.0*f);
      return mix(mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)),f.x),
                     mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)),f.x),
                     mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)),f.x),f.y),f.z);
    }

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      // Wobble the vertices along the normal to simulate unstable magic plasma
      float noiseVal = noise(position * 0.15 + vec3(0.0, 0.0, uTime * uSpeed));
      vec3 displacedPosition = position + normal * noiseVal * uWobble;
      
      vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorMagic; // Purple/magenta base
    uniform vec3 uColorCore;  // Bright cyan/blue core
    uniform float uIntensity;
    uniform float uGlow;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    // Robust 2D value noise helper
    float hash2d(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise2d(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash2d(i + vec2(0.0, 0.0)), hash2d(i + vec2(1.0, 0.0)), u.x),
                 mix(hash2d(i + vec2(0.0, 1.0)), hash2d(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    void main() {
      // Calculate fresnel glow
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5);
      
      // Calculate plasma noise current flowing through the arrow
      vec2 uvNoise = vUv * 3.0;
      uvNoise.y -= uTime * 1.5;
      float n1 = noise2d(uvNoise + vec2(uTime * 0.2, 0.0));
      float n2 = noise2d(uvNoise * 2.0 - vec2(0.0, uTime * 0.8));
      float combinedNoise = (n1 + n2 * 0.5) / 1.5;
      
      // Edge masking: make sure edges are soft and organic
      float edgeMask = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x)
                     * smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);

      // Interpolate colors based on noise and coordinate
      vec3 plasmaColor = mix(uColorMagic, uColorCore, combinedNoise * 0.5 + 0.5);
      
      // Combine base energy with edge glowing aura
      vec3 finalColor = mix(plasmaColor, uColorCore, fresnel) * (1.0 + combinedNoise * 0.3);
      float finalAlpha = (0.7 + fresnel * 0.3) * edgeMask * uIntensity;
      
      // Emissive boost
      gl_FragColor = vec4(finalColor * uGlow, finalAlpha);
    }
  `
}

export const DigitalGlitchShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uGlitch;      // 0.0 to 1.0 intensity
    uniform float uTime;
    varying vec2 vUv;

    float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      
      if (uGlitch > 0.01) {
        // Horizontal digital tearing slices
        float sliceY = floor(uv.y * 30.0 + sin(uTime * 50.0)) / 30.0;
        float sliceNoise = rand(vec2(sliceY, uTime));
        
        if (sliceNoise < uGlitch * 0.4) {
          float shiftX = (rand(vec2(sliceY, uTime + 1.0)) - 0.5) * uGlitch * 0.15;
          uv.x += shiftX;
        }
        
        // Chromatic aberration (RGB splitting)
        vec2 split = vec2(uGlitch * 0.01, 0.0);
        float r = texture2D(tDiffuse, uv - split).r;
        float g = texture2D(tDiffuse, uv).g;
        float b = texture2D(tDiffuse, uv + split).b;
        float a = texture2D(tDiffuse, uv).a;
        
        gl_FragColor = vec4(r, g, b, a);
      } else {
        gl_FragColor = texture2D(tDiffuse, uv);
      }
    }
  `
}
