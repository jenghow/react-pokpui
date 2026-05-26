import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Physics, RigidBody, type RapierRigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { ShengBeiBlock } from './ShengBeiBlock';
import { playWoodHitSound } from '../utils/sound';
import { createBrickTexture, createTileTexture } from '../utils/textures';
import type { Phase, ThrowResult } from '../types';

interface Scene3DProps {
  phase: Phase;
  onPhaseChange: (p: Phase) => void;
  onResult: (r: ThrowResult) => void;
  resetCount: number;
}

const REST_POSITION: [number, number, number][] = [
  [-0.2, 0.12, 0],
  [0.2, 0.12, 0],
];

const DROP_HEIGHT = 4.0;

const HALF_SIZE = 3.5;

function determineResult(localY0: THREE.Vector3, localY1: THREE.Vector3): ThrowResult {
  const up0 = localY0.y > 0.3;
  const up1 = localY1.y > 0.3;
  const down0 = localY0.y < -0.3;
  const down1 = localY1.y < -0.3;
  const edge0 = localY0.y >= -0.3 && localY0.y <= 0.3;
  const edge1 = localY1.y >= -0.3 && localY1.y <= 0.3;

  if (edge0 || edge1) return 'li-bei';
  if (up0 && down1) return 'sheng-bei';
  if (down0 && up1) return 'sheng-bei';
  if (up0 && up1) return 'xiao-bei';
  return 'yin-bei';
}
const WALL_HEIGHT = 6;
const WALL_THICKNESS = 0.15;

function Wall({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  const brickMap = useMemo(() => createBrickTexture(), []);
  return (
    <RigidBody type="fixed" restitution={0.06} friction={0.5}>
      <CuboidCollider args={size} position={position} />
      <mesh position={position} receiveShadow castShadow>
        <boxGeometry args={[size[0] * 2, size[1] * 2, size[2] * 2]} />
        <meshStandardMaterial
          map={brickMap}
          color="#9a9a9a"
          roughness={0.9}
          metalness={0}
        />
      </mesh>
    </RigidBody>
  );
}

function ResponsiveCamera() {
  const prevSize = useRef({ width: 0, height: 0 });

  useFrame((state) => {
    const { width, height } = state.size;
    if (width === prevSize.current.width && height === prevSize.current.height) return;
    prevSize.current = { width, height };

    const cam = state.camera as THREE.PerspectiveCamera;
    const aspect = width / height;
    if (aspect < 1) {
      cam.position.set(0, 5.5, 5.5);
      cam.fov = 60;
    } else {
      cam.position.set(0, 4.5, 5.5);
      cam.fov = 50;
    }
    cam.updateProjectionMatrix();
  });

  return null;
}

export function Scene3D({ phase, onPhaseChange, onResult, resetCount }: Scene3DProps) {
  const blockRefs = useRef<(RapierRigidBody | null)[]>([null, null]);
  const prevVy = useRef<number[]>([0, 0]);
  const settleTimer = useRef<number>(0);
  const resultSent = useRef(false);

  const setBlockRef = useCallback((index: number) => (ref: RapierRigidBody | null) => {
    blockRefs.current[index] = ref;
  }, []);

  useEffect(() => {
    if (phase !== 'throwing') return;

    resultSent.current = false;
    settleTimer.current = 0;
    prevVy.current = [0, 0];

    blockRefs.current.forEach((body) => {
      if (!body) return;
      body.setTranslation(
        { x: (Math.random() - 0.5) * 0.4, y: DROP_HEIGHT, z: (Math.random() - 0.5) * 0.2 },
        true,
      );
      const axis = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      const angle = Math.random() * Math.PI * 2;
      const rotQ = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      body.setRotation({ x: rotQ.x, y: rotQ.y, z: rotQ.z, w: rotQ.w }, true);
      body.setLinvel({ x: (Math.random() - 0.5) * 0.15, y: -3, z: (Math.random() - 0.5) * 0.1 }, true);
      body.setAngvel(
        {
          x: (Math.random() - 0.5) * 2.5,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 2.5,
        },
        true,
      );
      body.wakeUp();
    });

    onPhaseChange('settling');
  }, [phase, onPhaseChange]);

  useEffect(() => {
    if (resetCount === 0) return;
    blockRefs.current.forEach((body, i) => {
      if (!body) return;
      const pos = REST_POSITION[i];
      body.setTranslation({ x: pos[0], y: pos[1], z: pos[2] }, true);
      body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    });
  }, [resetCount]);

  useFrame((_, delta) => {
    if (phase !== 'settling') return;

    settleTimer.current += delta;

    const bodies = blockRefs.current;
    const b0 = bodies[0];
    const b1 = bodies[1];
    if (!b0 || !b1) return;

    for (let i = 0; i < 2; i++) {
      const body = bodies[i]!;
      const vel = body.linvel();
      if (prevVy.current[i] < -0.5 && vel.y > -0.05) {
        playWoodHitSound();
      }
      prevVy.current[i] = vel.y;
    }

    if (settleTimer.current < 0.6) return;

    const s0 = b0.isSleeping();
    const s1 = b1.isSleeping();
    const v0 = b0.linvel();
    const v1 = b1.linvel();
    const speed0 = Math.sqrt(v0.x * v0.x + v0.y * v0.y + v0.z * v0.z);
    const speed1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);

    const settled = (s0 || speed0 < 0.08) && (s1 || speed1 < 0.08);

    if (settled || settleTimer.current > 4) {
      if (resultSent.current) return;
      resultSent.current = true;

      const rot0 = b0.rotation();
      const rot1 = b1.rotation();
      const q0 = new THREE.Quaternion(rot0.x, rot0.y, rot0.z, rot0.w);
      const q1 = new THREE.Quaternion(rot1.x, rot1.y, rot1.z, rot1.w);
      const up = new THREE.Vector3(0, 1, 0);
      const localY0 = up.clone().applyQuaternion(q0);
      const localY1 = up.clone().applyQuaternion(q1);

      onResult(determineResult(localY0, localY1));
      onPhaseChange('result');
    }
  });

  const tileMap = useMemo(() => createTileTexture(), []);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 4, -3]} intensity={0.3} />
      <hemisphereLight args={['#D4B896', '#8B6F47', 0.3]} />

      <ResponsiveCamera />

      <Physics gravity={[0, -9.81, 0]}>
        <RigidBody type="fixed" restitution={0.55} friction={0.5}>
          <CuboidCollider args={[HALF_SIZE, 0.1, HALF_SIZE]} position={[0, -0.1, 0]} />
          <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[HALF_SIZE * 2, HALF_SIZE * 2]} />
            <meshStandardMaterial map={tileMap} roughness={0.9} metalness={0} />
          </mesh>
        </RigidBody>

        <Wall
          position={[-HALF_SIZE, WALL_HEIGHT / 2, 0]}
          size={[WALL_THICKNESS / 2, WALL_HEIGHT / 2, HALF_SIZE]}
        />
        <Wall
          position={[HALF_SIZE, WALL_HEIGHT / 2, 0]}
          size={[WALL_THICKNESS / 2, WALL_HEIGHT / 2, HALF_SIZE]}
        />
        <Wall
          position={[0, WALL_HEIGHT / 2, -HALF_SIZE]}
          size={[HALF_SIZE, WALL_HEIGHT / 2, WALL_THICKNESS / 2]}
        />
        <RigidBody type="fixed" restitution={0.06} friction={0.5}>
          <CuboidCollider
            args={[HALF_SIZE, WALL_HEIGHT / 2, WALL_THICKNESS / 2]}
            position={[0, WALL_HEIGHT / 2, HALF_SIZE]}
          />
        </RigidBody>

        <ShengBeiBlock
          ref={setBlockRef(0)}
          position={REST_POSITION[0]}
        />
        <ShengBeiBlock
          ref={setBlockRef(1)}
          position={REST_POSITION[1]}
        />
      </Physics>
    </>
  );
}
