import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sharedSpellState } from '../PolyhedronCanvas';

interface LightningArcsProps {
  mode: 'quick-pitch' | 'deep-dive';
  ringARef: React.RefObject<THREE.Object3D | null>;
  ringBRef: React.RefObject<THREE.Object3D | null>;
}

export const RingLightningArcs: React.FC<LightningArcsProps> = ({ mode, ringARef, ringBRef }) => {
  const lineRef = useRef<THREE.LineSegments>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [active, setActive] = useState(false);
  const triggerTimer = useRef(0);
  const arcDuration = useRef(0);
  const maxSegments = 32;

  const [positions, alphas] = useMemo(() => {
    return [new Float32Array(maxSegments * 2 * 3), new Float32Array(maxSegments * 2)];
  }, []);

  const generateLightningPath = (start: THREE.Vector3, end: THREE.Vector3, displace: number, numSegs: number) => {
    const points: THREE.Vector3[] = [start, end];
    let currentDisplace = displace;
    for (let i = 0; i < Math.log2(numSegs); i++) {
      const tempPoints = [...points];
      points.length = 0;
      points.push(tempPoints[0]);
      for (let j = 0; j < tempPoints.length - 1; j++) {
        const p1 = tempPoints[j];
        const p2 = tempPoints[j + 1];
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const tangent = new THREE.Vector3().crossVectors(dir, up).normalize();
        if (tangent.lengthSq() < 0.1) tangent.set(1, 0, 0);
        const angle = Math.random() * Math.PI * 2;
        tangent.applyAxisAngle(dir, angle);
        mid.addScaledVector(tangent, (Math.random() - 0.5) * currentDisplace);
        points.push(mid);
        points.push(p2);
      }
      currentDisplace *= 0.5;
    }

    const posAttr = new Float32Array(maxSegments * 2 * 3);
    const alpAttr = new Float32Array(maxSegments * 2);
    let index = 0;
    for (let i = 0; i < points.length - 1; i++) {
      if (index >= maxSegments * 2) break;
      posAttr[index * 3 + 0] = points[i].x;
      posAttr[index * 3 + 1] = points[i].y;
      posAttr[index * 3 + 2] = points[i].z;
      alpAttr[index] = 1.0 - (i / points.length);
      posAttr[(index + 1) * 3 + 0] = points[i + 1].x;
      posAttr[(index + 1) * 3 + 1] = points[i + 1].y;
      posAttr[(index + 1) * 3 + 2] = points[i + 1].z;
      alpAttr[index + 1] = 1.0 - ((i + 1) / points.length);
      index += 2;
    }
    return { posAttr, alpAttr };
  };

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    // Immediate grid lockdown deactivation check
    if (sharedSpellState.lockdown) {
      if (active) {
        setActive(false);
        if (lineRef.current) {
          const pos = lineRef.current.geometry.attributes.position as THREE.BufferAttribute;
          pos.copyArray(new Float32Array(positions.length));
          pos.needsUpdate = true;
        }
      }
      return;
    }

    triggerTimer.current += delta;

    // Spell overrides: lightning triggers snap arcs much faster, ignite overloads it
    const activeSpell = sharedSpellState.lightning || sharedSpellState.ignite;
    const interval = activeSpell ? 0.35 : (mode === 'quick-pitch' ? 4.5 : 2.0);
    const maxDuration = activeSpell ? 0.12 : (mode === 'quick-pitch' ? 0.35 : 0.15);

    if (!active && triggerTimer.current > interval) {
      const probability = activeSpell ? 0.95 : 0.45;
      if (Math.random() < probability && ringARef.current && ringBRef.current) {
        setActive(true);
        arcDuration.current = 0;
        triggerTimer.current = 0;
      }
    }

    if (active) {
      arcDuration.current += delta;
      if (arcDuration.current > maxDuration) {
        setActive(false);
        if (lineRef.current) {
          const pos = lineRef.current.geometry.attributes.position as THREE.BufferAttribute;
          pos.copyArray(new Float32Array(positions.length));
          pos.needsUpdate = true;
        }
        return;
      }

      if (ringARef.current && ringBRef.current && lineRef.current) {
        const startWorld = new THREE.Vector3();
        const endWorld = new THREE.Vector3();
        const angleA = state.clock.getElapsedTime() * 2.0;
        const angleB = -state.clock.getElapsedTime() * 1.5;

        startWorld.set(Math.cos(angleA) * 1.4, 0, Math.sin(angleA) * 1.4);
        endWorld.set(Math.cos(angleB) * 1.8, 0, Math.sin(angleB) * 1.8);

        ringARef.current.localToWorld(startWorld);
        ringBRef.current.localToWorld(endWorld);

        lineRef.current.worldToLocal(startWorld);
        lineRef.current.worldToLocal(endWorld);

        const { posAttr, alpAttr } = generateLightningPath(startWorld, endWorld, mode === 'quick-pitch' ? 0.4 : 0.65, maxSegments);

        const pos = lineRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const alp = lineRef.current.geometry.attributes.aAlpha as THREE.BufferAttribute;
        pos.copyArray(posAttr);
        alp.copyArray(alpAttr);
        pos.needsUpdate = true;
        alp.needsUpdate = true;
      }
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      const targetBlend = mode === 'quick-pitch' ? 0.0 : 1.0;
      materialRef.current.uniforms.uModeBlend.value = THREE.MathUtils.lerp(materialRef.current.uniforms.uModeBlend.value, targetBlend, 0.08);
      materialRef.current.uniforms.uGlowIntensity.value = active ? (1.0 - arcDuration.current / maxDuration) * THREE.MathUtils.lerp(3.5, 6.0, targetBlend) : 0.0;
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
        uColorDDA: { value: new THREE.Color('#B44AFF') },
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
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aAlpha" args={[alphas, 1]} />
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
