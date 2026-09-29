import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sharedSpellState } from '../PolyhedronCanvas';

const UP = new THREE.Vector3(0, 1, 0);

interface LightningArcsProps {
  mode: 'quick-pitch' | 'deep-dive';
  ringARef: React.RefObject<THREE.Object3D | null>;
  ringBRef: React.RefObject<THREE.Object3D | null>;
  pyramidsGroupRef?: React.RefObject<THREE.Group | null>;
}

export const RingLightningArcs: React.FC<LightningArcsProps> = ({ mode, ringARef, ringBRef, pyramidsGroupRef }) => {
  const lineRef = useRef<THREE.LineSegments>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [active, setActive] = useState(false);
  const triggerTimer = useRef(1.0);
  const arcDuration = useRef(0);
  const maxSegments = 32;
  const numArcs = 12; // 12 dynamic paths

  const targetPyramidIdxA = useRef(0);
  const targetPyramidIdxB = useRef(0);
  const updateIndex = useRef(0); // For staggered scheduling

  // 1. Pre-allocated flat buffers bound to geometry
  const positionsRef = useRef(new Float32Array(maxSegments * 2 * 3 * numArcs))
  const alphasRef = useRef(new Float32Array(maxSegments * 2 * numArcs))

  // 2. Pre-allocated vector pool for zero-garbage mathematics
  const calcPoints = useMemo(() => Array.from({ length: 33 }, () => new THREE.Vector3()), [])
  const tempPoints = useMemo(() => Array.from({ length: 33 }, () => new THREE.Vector3()), [])
  const vectorPool = useMemo(() => Array.from({ length: 512 }, () => new THREE.Vector3()), [])
  const poolIdxRef = useRef(0)
  const getScratchVector = () => {
    const v = vectorPool[poolIdxRef.current]
    poolIdxRef.current = (poolIdxRef.current + 1) % 512
    return v
  }

  // 3. In-place zero-allocation path generation
  const generateLightningPathInPlace = (
    start: THREE.Vector3, 
    end: THREE.Vector3, 
    displace: number, 
    numSegs: number,
    posOffset: number,
    alpOffset: number
  ) => {
    calcPoints[0].copy(start);
    calcPoints[1].copy(end);
    let currentDisplace = displace;
    let currentSegmentCount = 1;

    for (let i = 0; i < Math.log2(numSegs); i++) {
      const pointsCount = currentSegmentCount + 1;
      for (let idx = 0; idx < pointsCount; idx++) {
        tempPoints[idx].copy(calcPoints[idx]);
      }
      
      calcPoints[0].copy(tempPoints[0]);
      for (let j = 0; j < pointsCount - 1; j++) {
        const p1 = tempPoints[j];
        const p2 = tempPoints[j + 1];
        const midIdx = j * 2 + 1;
        const p2Idx = j * 2 + 2;

        calcPoints[p2Idx].copy(p2);

        const mid = calcPoints[midIdx].addVectors(p1, p2).multiplyScalar(0.5);
        const dir = getScratchVector().subVectors(p2, p1).normalize();
        const tangent = getScratchVector().crossVectors(dir, UP).normalize();
        if (tangent.lengthSq() < 0.1) tangent.set(1, 0, 0);
        const angle = Math.random() * Math.PI * 2;
        tangent.applyAxisAngle(dir, angle);
        mid.addScaledVector(tangent, (Math.random() - 0.5) * currentDisplace);
      }
      currentSegmentCount *= 2;
      currentDisplace *= 0.5;
    }

    // Copy to flat output buffers in-place
    const totalPoints = currentSegmentCount + 1;
    let index = 0;
    for (let i = 0; i < totalPoints - 1; i++) {
      if (index >= maxSegments * 2) break;
      const ptA = calcPoints[i];
      const ptB = calcPoints[i + 1];
      
      const pIdx = posOffset + index * 3;
      positionsRef.current[pIdx + 0] = ptA.x;
      positionsRef.current[pIdx + 1] = ptA.y;
      positionsRef.current[pIdx + 2] = ptA.z;
      
      const pIdxNext = posOffset + (index + 1) * 3;
      positionsRef.current[pIdxNext + 0] = ptB.x;
      positionsRef.current[pIdxNext + 1] = ptB.y;
      positionsRef.current[pIdxNext + 2] = ptB.z;

      const aIdx = alpOffset + index;
      alphasRef.current[aIdx] = 1.0 - (i / totalPoints);
      alphasRef.current[aIdx + 1] = 1.0 - ((i + 1) / totalPoints);
      
      index += 2;
    }
  };

  useFrame((state, rawDelta) => {
    poolIdxRef.current = 0; // Reset scratch index at the start of frame
    const delta = Math.min(rawDelta, 0.1);
    if (sharedSpellState.lockdown) {
      if (active) {
        setActive(false);
        if (lineRef.current) {
          const pos = lineRef.current.geometry.attributes.position as THREE.BufferAttribute;
          pos.array.fill(0);
          pos.needsUpdate = true;
        }
      }
      return;
    }

    triggerTimer.current += delta;
    const activeSpell = sharedSpellState.lightning || sharedSpellState.ignite;
    const interval = activeSpell ? 0.15 : 0.85;
    const maxDuration = activeSpell ? 0.22 : 0.40;

    if (!active && triggerTimer.current > interval) {
      const probability = activeSpell ? 0.95 : 0.70;
      if (Math.random() < probability && ringARef.current && ringBRef.current) {
        setActive(true);
        arcDuration.current = 0;
        triggerTimer.current = 0;

        if (pyramidsGroupRef?.current && pyramidsGroupRef.current.children.length > 0) {
          const count = pyramidsGroupRef.current.children.length;
          targetPyramidIdxA.current = Math.floor(Math.random() * count);
          targetPyramidIdxB.current = Math.floor(Math.random() * count);
        }
      }
    }

    if (active) {
      arcDuration.current += delta;
      if (arcDuration.current > maxDuration) {
        setActive(false);
        if (lineRef.current) {
          const pos = lineRef.current.geometry.attributes.position as THREE.BufferAttribute;
          pos.array.fill(0);
          pos.needsUpdate = true;
        }
        return;
      }

      if (ringARef.current && ringBRef.current && lineRef.current) {
        const startA = getScratchVector();
        const startA2 = getScratchVector();
        const startB = getScratchVector();
        const startB2 = getScratchVector();
        const shellA = getScratchVector();
        const shellB = getScratchVector();

        const elapsed = state.clock.getElapsedTime();
        const angleA = elapsed * 2.0;
        const angleB = -elapsed * 1.5;

        startA.set(Math.cos(angleA) * 1.65, 0, Math.sin(angleA) * 1.65);
        startA2.set(Math.cos(angleA + Math.PI) * 1.65, 0, Math.sin(angleA + Math.PI) * 1.65);
        startB.set(Math.cos(angleB) * 2.15, 0, Math.sin(angleB) * 2.15);
        startB2.set(Math.cos(angleB + Math.PI) * 2.15, 0, Math.sin(angleB + Math.PI) * 2.15);

        ringARef.current.localToWorld(startA);
        ringARef.current.localToWorld(startA2);
        ringBRef.current.localToWorld(startB);
        ringBRef.current.localToWorld(startB2);

        let gotShell = false;
        if (pyramidsGroupRef?.current && pyramidsGroupRef.current.children.length > 0) {
          const childA = pyramidsGroupRef.current.children[targetPyramidIdxA.current];
          const childB = pyramidsGroupRef.current.children[targetPyramidIdxB.current];
          if (childA && childB) {
            childA.getWorldPosition(shellA);
            childB.getWorldPosition(shellB);
            gotShell = true;
          }
        }

        lineRef.current.worldToLocal(startA);
        lineRef.current.worldToLocal(startA2);
        lineRef.current.worldToLocal(startB);
        lineRef.current.worldToLocal(startB2);

        if (gotShell) {
          lineRef.current.worldToLocal(shellA);
          lineRef.current.worldToLocal(shellB);
        } else {
          shellA.copy(startA).multiplyScalar(0.5);
          shellB.copy(startB).multiplyScalar(0.5);
        }

        // Staggered update schedule: compute 3 paths out of 12 per frame
        const stridePos = maxSegments * 2 * 3;
        const strideAlp = maxSegments * 2;
        const displaceAmt = mode === 'quick-pitch' ? 0.4 : 0.65;

        // Path generators lookup across 2 rings and pyramid shell
        const runGenerator = (pIdx: number) => {
          const pOffset = pIdx * stridePos;
          const aOffset = pIdx * strideAlp;

          // Ring 1 <-> Ring 2 arcs
          if (pIdx === 0) generateLightningPathInPlace(startA, startB, displaceAmt, maxSegments, pOffset, aOffset);
          else if (pIdx === 1) generateLightningPathInPlace(startA2, startB2, displaceAmt, maxSegments, pOffset, aOffset);
          else if (pIdx === 2) generateLightningPathInPlace(startA, startB2, displaceAmt, maxSegments, pOffset, aOffset);
          else if (pIdx === 3) generateLightningPathInPlace(startB, startA2, displaceAmt, maxSegments, pOffset, aOffset);
          // Ring 1 <-> Pyramid Shell arcs
          else if (pIdx === 4) generateLightningPathInPlace(startA, shellA, displaceAmt, maxSegments, pOffset, aOffset);
          else if (pIdx === 5) generateLightningPathInPlace(startA2, shellB, displaceAmt, maxSegments, pOffset, aOffset);
          else if (pIdx === 6) generateLightningPathInPlace(startA, shellB, displaceAmt, maxSegments, pOffset, aOffset);
          else if (pIdx === 7) generateLightningPathInPlace(startA2, shellA, displaceAmt, maxSegments, pOffset, aOffset);
          // Ring 2 <-> Pyramid Shell arcs
          else if (pIdx === 8) generateLightningPathInPlace(startB, shellA, displaceAmt, maxSegments, pOffset, aOffset);
          else if (pIdx === 9) generateLightningPathInPlace(startB2, shellB, displaceAmt, maxSegments, pOffset, aOffset);
          else if (pIdx === 10) generateLightningPathInPlace(startB, shellB, displaceAmt, maxSegments, pOffset, aOffset);
          else if (pIdx === 11) generateLightningPathInPlace(startB2, shellA, displaceAmt, maxSegments, pOffset, aOffset);
        };

        const idx = updateIndex.current;
        runGenerator(idx);
        runGenerator((idx + 1) % numArcs);
        runGenerator((idx + 2) % numArcs);

        updateIndex.current = (idx + 3) % numArcs;

        const pos = lineRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const alp = lineRef.current.geometry.attributes.aAlpha as THREE.BufferAttribute;
        pos.needsUpdate = true;
        alp.needsUpdate = true;
      }
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      const targetBlend = mode === 'quick-pitch' ? 0.0 : 1.0;
      materialRef.current.uniforms.uModeBlend.value = THREE.MathUtils.lerp(materialRef.current.uniforms.uModeBlend.value, targetBlend, 0.08);
      const pulseMult = (sharedSpellState.pulseScale || 1.0);
      const baseGlow = activeSpell ? THREE.MathUtils.lerp(3.0, 4.5, targetBlend) : THREE.MathUtils.lerp(1.8, 2.6, targetBlend);
      materialRef.current.uniforms.uGlowIntensity.value = active ? (1.0 - arcDuration.current / maxDuration) * baseGlow * pulseMult : 0.0;
    }
  });

  const lightningShader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uModeBlend: { value: 0 },
        uGlowIntensity: { value: 0 },
        uColorQPA: { value: new THREE.Color('#FFB44A') },
        uColorQPB: { value: new THREE.Color('#FFFFFF') },
        uColorDDA: { value: new THREE.Color('#4A8FFF') },
        uColorDDB: { value: new THREE.Color('#4AFFB4') },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uGlowIntensity;
        attribute float aAlpha;
        varying float vAlpha;
        varying vec3 vWorldPosition;
        void main() {
          vAlpha = aAlpha;
          vec3 pos = position;
          if (uGlowIntensity > 0.0) {
            pos.x += sin(uTime * 150.0 + position.y * 10.0) * 0.012;
            pos.y += cos(uTime * 180.0 + position.z * 10.0) * 0.012;
          }
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uGlowIntensity;
        uniform float uModeBlend;
        uniform vec3 uColorQPA;
        uniform vec3 uColorQPB;
        uniform vec3 uColorDDA;
        uniform vec3 uColorDDB;
        varying float vAlpha;
        varying vec3 vWorldPosition;
        void main() {
          if (uGlowIntensity < 0.05) discard;
          float flow = sin(vWorldPosition.y * 3.0 - uTime * 25.0) * 0.5 + 0.5;
          vec3 qpColor = mix(uColorQPA, uColorQPB, flow);
          vec3 ddColor = mix(uColorDDA, uColorDDB, flow);
          vec3 finalColor = mix(qpColor, ddColor, uModeBlend);
          float flicker = sin(uTime * 120.0) * 0.15 + 0.85;
          gl_FragColor = vec4(finalColor * uGlowIntensity * flicker, vAlpha);
        }
      `
    };
  }, []);

  return (
    <lineSegments ref={lineRef} raycast={() => {}}>
      <bufferGeometry>
        {/* R3F requires the typed-array reference here at JSX-creation time to
            build the BufferAttribute, while the same arrays are mutated in
            place every frame by useFrame. That dual use (read at render +
            mutate post-commit) is the canonical R3F mutable-buffer pattern
            and has no React-pure equivalent, so we intentionally read the
            ref during render. */}
        {/* eslint-disable-next-line react-hooks/refs */}
        <bufferAttribute attach="attributes-position" args={[positionsRef.current, 3]} />
        {/* eslint-disable-next-line react-hooks/refs */}
        <bufferAttribute attach="attributes-aAlpha" args={[alphasRef.current, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={lightningShader.vertexShader}
        fragmentShader={lightningShader.fragmentShader}
        uniforms={lightningShader.uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
};
