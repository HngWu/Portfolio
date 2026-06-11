import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sharedSpellState } from '../PolyhedronCanvas';

const RunicDustShader = {
  uniforms: {
    uTime: { value: 0 },
    uModeBlend: { value: 0.0 }, // 0.0 = Quick Pitch, 1.0 = Deep Dive
    uSize: { value: 15.0 },
    uSpeed: { value: 0.3 },
    uColorQPA: { value: new THREE.Color('#FF8C00') },
    uColorQPB: { value: new THREE.Color('#FFB44A') },
    uColorDDA: { value: new THREE.Color('#6A0DAD') },
    uColorDDB: { value: new THREE.Color('#4AFFB4') },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uModeBlend;
    uniform float uSize;
    uniform float uSpeed;
    uniform vec3 uColorQPA;
    uniform vec3 uColorQPB;
    uniform vec3 uColorDDA;
    uniform vec3 uColorDDB;
    attribute float aSizeMultiplier;
    attribute vec3 aRandoms;
    varying vec3 vColor;
    varying float vAlpha;

    // Simplex Noise 3D
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857; 
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z); 
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_); 
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
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
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)).xyzz, 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    vec3 curlNoise(vec3 p) {
      const float e = 0.1;
      float dx = snoise(p + vec3(e, 0.0, 0.0)) - snoise(p - vec3(e, 0.0, 0.0));
      float dy = snoise(p + vec3(0.0, e, 0.0)) - snoise(p - vec3(0.0, e, 0.0));
      float dz = snoise(p + vec3(0.0, 0.0, e)) - snoise(p - vec3(0.0, 0.0, e));
      return vec3(dy - dz, dz - dx, dx - dy) / (2.0 * e);
    }

    void main() {
      float speedFactor = mix(1.0, 2.5, uModeBlend);
      float time = uTime * uSpeed * speedFactor;
      vec3 pos = position;
      float angle = time + aRandoms.x * 6.2831;
      float radius = length(pos.xz) + sin(time + aRandoms.y * 3.0) * 0.1;
      pos.x = cos(angle) * radius;
      pos.z = sin(angle) * radius;
      vec3 noisePos = pos * 1.5 + vec3(0.0, time * 0.5, 0.0);
      vec3 noiseForce = curlNoise(noisePos) * mix(0.18, 0.35, uModeBlend);
      pos += noiseForce;
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      vec3 qpColor = mix(uColorQPA, uColorQPB, aRandoms.z);
      vec3 ddColor = mix(uColorDDA, uColorDDB, aRandoms.z);
      vColor = mix(qpColor, ddColor, uModeBlend);
      float distanceToCenter = length(pos);
      vAlpha = smoothstep(2.5, 0.5, distanceToCenter) * (0.3 + 0.7 * aRandoms.y);
      gl_PointSize = uSize * aSizeMultiplier * (300.0 / -mvPosition.z) * (1.0 + 0.5 * sin(time * 3.0 + aRandoms.x * 10.0));
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      float glyphLine = step(0.03, abs(center.x)) * step(0.03, abs(center.y));
      float mask = smoothstep(0.5, 0.0, dist);
      float glow = mask * (0.6 + 0.4 * (1.0 - glyphLine));
      if (glow < 0.01) discard;
      gl_FragColor = vec4(vColor * glow * 1.8, glow * vAlpha);
    }
  `,
};

export const RunicDustStreams = ({ mode, count = 1500 }: { mode: 'quick-pitch' | 'deep-dive', count?: number }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const runicDustUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uModeBlend: { value: 0.0 },
    uSize: { value: 15.0 },
    uSpeed: { value: 0.3 },
    uColorQPA: { value: new THREE.Color('#FF8C00') },
    uColorQPB: { value: new THREE.Color('#FFB44A') },
    uColorDDA: { value: new THREE.Color('#6A0DAD') },
    uColorDDB: { value: new THREE.Color('#4AFFB4') },
  }), []);

  const { positions, randoms, sizeMultipliers } = useMemo(() => {
    let seed = 42;
    function pseudoRandom() {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    }
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const ringRadius = 1.6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      pos[i * 3 + 0] = Math.cos(angle) * ringRadius + (pseudoRandom() - 0.5) * 0.15;
      pos[i * 3 + 1] = (pseudoRandom() - 0.5) * 0.3;
      pos[i * 3 + 2] = Math.sin(angle) * ringRadius + (pseudoRandom() - 0.5) * 0.15;
      rand[i * 3 + 0] = pseudoRandom();
      rand[i * 3 + 1] = pseudoRandom();
      rand[i * 3 + 2] = pseudoRandom();
      sizes[i] = 0.2 + pseudoRandom() * 0.8;
    }
    return { positions: pos, randoms: rand, sizeMultipliers: sizes };
  }, [count]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      
      let targetBlend = mode === 'quick-pitch' ? 0.0 : 1.0;
      if (sharedSpellState.ignite) targetBlend = 1.0;

      materialRef.current.uniforms.uModeBlend.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uModeBlend.value,
        targetBlend,
        0.05
      );

      let speedFactor = 0.3;
      if (sharedSpellState.lockdown) speedFactor = 0.0;
      else if (sharedSpellState.ignite) speedFactor = 1.2;
      materialRef.current.uniforms.uSpeed.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uSpeed.value,
        speedFactor,
        delta * 6.0
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aRandoms" args={[randoms, 3]} />
        <bufferAttribute attach="attributes-aSizeMultiplier" args={[sizeMultipliers, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={RunicDustShader.vertexShader}
        fragmentShader={RunicDustShader.fragmentShader}
        uniforms={runicDustUniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
