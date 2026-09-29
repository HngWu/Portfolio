import * as THREE from "three"

const NOISE_GLSL = `
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - D.yyy;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p) {
  float f = 0.0;
  f += 0.5000 * snoise(p); p *= 2.02;
  f += 0.2500 * snoise(p); p *= 2.03;
  f += 0.1250 * snoise(p);
  return f;
}
`

export const EmissiveFractureShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;

    void main() {
      vLocalPosition = position;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalize(normalMatrix * normal);
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    ${NOISE_GLSL}

    uniform float uTime;
    uniform float uModeProgress;
    uniform float uIgniteActive;
    uniform float uLockdownActive;
    uniform float uTensionProgress;
    uniform float uGlowIntensity;
    uniform float uShudder;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;

    void main() {
      // Inky dark obsidian mirror foundation
      vec3 mirrorBase = vec3(0.012, 0.015, 0.022);

      // Mode energy caustics: Quick Pitch Warm Gold vs Deep Dive Electric Blueprint Blue (#4A8FFF) + Cyber Cyan-Green (#4AFFB4)
      vec3 colorGold = vec3(1.0, 0.72, 0.22);
      vec3 colorBlue = vec3(0.29, 0.56, 1.0);      // #4A8FFF Electric Blueprint Blue
      vec3 colorCyanGreen = vec3(0.29, 1.0, 0.70); // #4AFFB4 Cyber Cyan-Green
      vec3 accentColor = mix(colorGold, colorBlue, uModeProgress);

      if (uIgniteActive > 0.5) {
        accentColor = vec3(1.0, 0.44, 0.08); // Blazing magma orange
        mirrorBase = vec3(0.04, 0.012, 0.012);
      } else if (uLockdownActive > 0.5) {
        accentColor = vec3(0.20, 0.30, 0.42); // Dim EMP slate
        mirrorBase = vec3(0.01, 0.012, 0.015);
      }

      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float NdotV = max(dot(normal, viewDir), 0.0);

      // Sharp mirror Fresnel rim reflection on cut facets
      float fresnel = pow(1.0 - NdotV, 2.8);

      // Directional specular glints for mirror sheen
      vec3 lightDir1 = normalize(vec3(0.8, 1.0, 0.6));
      vec3 lightDir2 = normalize(vec3(-0.7, -0.6, 0.9));
      float glint1 = pow(max(dot(reflect(-lightDir1, normal), viewDir), 0.0), 32.0);
      float glint2 = pow(max(dot(reflect(-lightDir2, normal), viewDir), 0.0), 24.0);
      float mirrorSpecular = glint1 * 0.7 + glint2 * 0.5;

      // Animated energy caustics moving through the fracture faces
      vec3 flowCoords = vLocalPosition * 3.5 + vec3(uTime * 0.25, -uTime * 0.20, uTime * 0.15);
      float caustics = fbm(flowCoords + fbm(flowCoords * 1.5) * 0.8);
      float causticPulse = smoothstep(-0.2, 0.6, caustics);

      // Micro-shudder high frequency intensity flicker
      float shudderNoise = sin(uTime * 45.0 + vLocalPosition.x * 20.0) * uShudder * 0.15;

      // When tension locked, high electromagnetic pressure surges energy through the cleavage fissures
      float hollowExposure = mix(1.25, 2.35, uTensionProgress);

      // Boost caustics and specular shimmer during tension lock
      float tensionBoost = mix(1.0, 1.75, uTensionProgress);

      // Deep Dive dual-tone caustic surge: cyan-green caustics and fresnel rims over blueprint blue foundation
      vec3 deepDiveColor = mix(colorBlue, colorCyanGreen, clamp(causticPulse * 0.75 + fresnel * 0.45, 0.0, 1.0));
      vec3 effectiveAccent = (uIgniteActive > 0.5 || uLockdownActive > 0.5) ? accentColor : mix(colorGold, deepDiveColor, uModeProgress);

      // Composite color with additive emissive core
      vec3 emissiveLight = effectiveAccent * (
        fresnel * 1.2 * tensionBoost +
        causticPulse * 1.5 * tensionBoost +
        mirrorSpecular * 1.4 +
        shudderNoise * 2.0
      ) * hollowExposure * uGlowIntensity;

      vec3 finalColor = mirrorBase + emissiveLight;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,

  uniforms: {
    uTime: { value: 0 },
    uModeProgress: { value: 0.0 },
    uIgniteActive: { value: 0.0 },
    uLockdownActive: { value: 0.0 },
    uTensionProgress: { value: 0.0 },
    uGlowIntensity: { value: 1.25 },
    uShudder: { value: 0.0 }
  }
}

export function createEmissiveFractureMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: EmissiveFractureShader.vertexShader,
    fragmentShader: EmissiveFractureShader.fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uModeProgress: { value: 0.0 },
      uIgniteActive: { value: 0.0 },
      uLockdownActive: { value: 0.0 },
      uTensionProgress: { value: 0.0 },
      uGlowIntensity: { value: 1.25 },
      uShudder: { value: 0.0 }
    },
    transparent: false,
    depthWrite: true,
  })
}
