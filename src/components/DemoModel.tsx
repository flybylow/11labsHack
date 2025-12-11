import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Sphere, Torus } from '@react-three/drei'
import * as THREE from 'three'
import type { HotspotData } from '../types'
import { Html } from '@react-three/drei'

// Demo model for testing when no GLB/GLTF is available
interface DemoModelProps {
  hotspots: HotspotData[]
  activeHotspot: string | null
  editingHotspot: string | null
  autoRotate: boolean
  rotationSpeed: number
  onHotspotClick?: (id: string) => void
}

// Annotation component for demo model
function Annotation({ 
  position, 
  isActive, 
  isEditing, 
  onClick, 
  children 
}: { 
  position: [number, number, number]
  isActive: boolean
  isEditing?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Html
      position={position}
      occlude="blending"
      transform
      sprite
      distanceFactor={3}
      style={{
        transition: 'all 0.2s',
        opacity: 1,
        transform: `scale(${isActive ? 1.2 : 1})`,
        pointerEvents: 'auto',
      }}
    >
      <div
        className={`annotation ${isActive ? 'active' : ''} ${isEditing ? 'editing' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
      >
        <div className="annotation-dot" />
        <div className="annotation-label">{children}</div>
      </div>
    </Html>
  )
}

export default function DemoModel({
  hotspots,
  activeHotspot,
  editingHotspot,
  autoRotate,
  rotationSpeed,
  onHotspotClick
}: DemoModelProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += rotationSpeed
    }
  })

  return (
    <group ref={groupRef}>
      {/* Central cube */}
      <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.1} smoothness={4} position={[0, 0.75, 0]}>
        <meshStandardMaterial 
          color="#6366f1" 
          metalness={0.5} 
          roughness={0.2}
          envMapIntensity={1}
        />
      </RoundedBox>

      {/* Floating spheres */}
      <Sphere args={[0.3, 32, 32]} position={[1.5, 1.2, 0]}>
        <meshStandardMaterial 
          color="#ec4899" 
          metalness={0.8} 
          roughness={0.1}
        />
      </Sphere>
      
      <Sphere args={[0.25, 32, 32]} position={[-1.3, 0.8, 0.8]}>
        <meshStandardMaterial 
          color="#22c55e" 
          metalness={0.8} 
          roughness={0.1}
        />
      </Sphere>

      <Sphere args={[0.2, 32, 32]} position={[0.5, 2, -0.5]}>
        <meshStandardMaterial 
          color="#f59e0b" 
          metalness={0.8} 
          roughness={0.1}
        />
      </Sphere>

      {/* Orbiting torus */}
      <Torus args={[0.5, 0.15, 16, 32]} position={[-1.2, 1.5, -0.8]} rotation={[Math.PI / 4, 0, 0]}>
        <meshStandardMaterial 
          color="#8b5cf6" 
          metalness={0.6} 
          roughness={0.2}
        />
      </Torus>

      {/* Base platform */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[2, 2.2, 0.1, 64]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.9} 
          roughness={0.3}
        />
      </mesh>

      {/* Glowing ring */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 2, 64]} />
        <meshBasicMaterial 
          color="#6366f1" 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hotspot annotations */}
      {hotspots.map((hotspot) => (
        <Annotation
          key={hotspot.id}
          position={hotspot.position}
          isActive={activeHotspot === hotspot.id}
          isEditing={editingHotspot === hotspot.id}
          onClick={() => onHotspotClick?.(hotspot.id)}
        >
          {hotspot.title}
        </Annotation>
      ))}
    </group>
  )
}

