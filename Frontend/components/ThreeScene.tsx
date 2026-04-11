'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function AbstractHealthOrb() {
  const innerMeshRef = useRef<THREE.Mesh>(null);
  
  // THREE.Timer is requested by threejs-animation skill
  // However, useFrame provides a clock. For best practice, we utilize state.clock
  useFrame((state) => {
    if (innerMeshRef.current) {
      innerMeshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      innerMeshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      {/* Outer Glow / Wireframe */}
      <Sphere args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color="#3b82f6"
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={0.2}
          wireframe={true}
          transparent
          opacity={0.15}
        />
      </Sphere>

      {/* Inner Solid Orb */}
      <Sphere ref={innerMeshRef} args={[1.2, 64, 64]}>
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Sphere>

      {/* Core Plasma */}
      <Sphere args={[0.8, 32, 32]}>
        <meshBasicMaterial color="#a855f7" transparent opacity={0.6} />
      </Sphere>
    </Float>
  );
}

export default function ThreeScene() {
  return (
    <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true }}>
        <color attach="background" args={['#020617']} />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} color="#60a5fa" intensity={2} />
        <pointLight position={[-10, -10, -10]} color="#a855f7" intensity={2} />
        <pointLight position={[0, -5, 5]} color="#3b82f6" intensity={1} />
        
        {/* Starfield for deep tech vibe */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        {/* The Main Attraction */}
        <AbstractHealthOrb />
        
        {/* Subtle camera movement */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.5} 
          enableDamping 
          dampingFactor={0.05}
        />
      </Canvas>
      
      {/* Overlay to blend the canvas seamlessly into the dark background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-transparent to-[#020617] pointer-events-none" />
    </div>
  );
}
