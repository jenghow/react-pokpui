import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { RigidBody, type RapierRigidBody, ConvexHullCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { createWoodTexture } from '../utils/textures';

function createHalfEllipsoidGeometry(width: number, height: number, depth: number, segs = 24) {
  const geo = new THREE.SphereGeometry(1, segs, Math.ceil(segs / 2), 0, Math.PI * 2, 0, Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(i, pos.getX(i) * width, pos.getY(i) * height, pos.getZ(i) * depth);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function getColliderVertices(geo: THREE.BufferGeometry) {
  const pos = geo.attributes.position;
  const verts: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (Math.abs(y) < 0.001) {
      const a = Math.atan2(z, x);
      y = Math.sin(a * 5 + 0.7) * 0.006 - 0.006;
    }
    verts.push(x, y, z);
  }
  return verts;
}

interface ShengBeiBlockProps {
  position: [number, number, number];
}

export const ShengBeiBlock = forwardRef<RapierRigidBody, ShengBeiBlockProps>(
  ({ position }, ref) => {
    const innerRef = useRef<RapierRigidBody>(null);
    useImperativeHandle(ref, () => innerRef.current!, []);

    const { geometry, colliderVerts } = useMemo(() => {
      const geo = createHalfEllipsoidGeometry(0.38, 0.28, 0.26);
      return { geometry: geo, colliderVerts: getColliderVertices(geo) };
    }, []);

    const woodTexture = useMemo(() => createWoodTexture(), []);

    return (
      <RigidBody
        ref={innerRef}
        position={position}
        restitution={0.25}
        friction={0.6}
        mass={0.3}
        canSleep
      >
        <ConvexHullCollider args={[colliderVerts]} />
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color="#CC2222"
            roughness={0.7}
            metalness={0.15}
          />
        </mesh>
        <mesh
          position={[0, 0.001, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[0.76, 0.52, 1]}
        >
          <circleGeometry args={[0.5, 32]} />
          <meshStandardMaterial
            color="#CC2222"
            roughness={0.7}
            metalness={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      </RigidBody>
    );
  }
);
