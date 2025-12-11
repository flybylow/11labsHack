import { Suspense, useRef, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  useGLTF, 
  Html, 
  CameraControls, 
  Environment,
  ContactShadows 
} from '@react-three/drei'
import * as THREE from 'three'
import { easing } from 'maath'
import type { HotspotData, SavedConfiguration } from '../types'
import DemoModel from './DemoModel'
import './ModelViewer.css'

// Extend for rounded plane geometry
declare module 'maath' {
  export namespace geometry {
    function roundedPlaneGeometry(
      width: number,
      height: number,
      radius: number,
      segments?: number
    ): THREE.BufferGeometry
  }
}

// =============================================================================
// ANNOTATION COMPONENT - 3D Hotspot Markers
// =============================================================================
interface AnnotationProps {
  position: [number, number, number]
  isActive: boolean
  isEditing?: boolean
  onClick: () => void
  children: React.ReactNode
}

function Annotation({ position, isActive, isEditing, onClick, children }: AnnotationProps) {
  return (
    <Html
      position={position}
      center
      distanceFactor={8}
      zIndexRange={[100, 0]}
      style={{
        pointerEvents: 'auto',
      }}
    >
      <div
        className={`annotation ${isActive ? 'active' : ''} ${isEditing ? 'editing' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        style={{
          transform: `scale(${isActive ? 1.1 : 1})`,
          transition: 'transform 0.2s ease',
        }}
      >
        <div className="annotation-dot" />
        <div className="annotation-label">{children}</div>
      </div>
    </Html>
  )
}

// =============================================================================
// MODEL COMPONENT - 3D Model with Hotspots
// =============================================================================
interface ModelProps {
  modelPath: string
  hotspots: HotspotData[]
  activeHotspot: string | null
  editingHotspot: string | null
  editMode: boolean
  autoRotate: boolean
  rotationSpeed: number
  onHotspotClick?: (id: string) => void
}

function Model({
  modelPath,
  hotspots,
  activeHotspot,
  editingHotspot,
  editMode,
  autoRotate,
  rotationSpeed,
  onHotspotClick
}: ModelProps) {
  const rotatingGroupRef = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Group>(null)
  const light = useRef<THREE.SpotLight>(null)
  
  // Load the GLTF model
  const { scene } = useGLTF(modelPath)
  const clonedScene = scene.clone()

  // Center the model at origin
  useEffect(() => {
    if (!modelRef.current) return
    
    const box = new THREE.Box3().setFromObject(modelRef.current)
    const center = box.getCenter(new THREE.Vector3())
    modelRef.current.position.sub(center)
    
    // Also position slightly above ground
    const size = box.getSize(new THREE.Vector3())
    modelRef.current.position.y += size.y / 2
  }, [clonedScene])

  // Animation loop - auto-rotation and light animation
  useFrame((state, delta) => {
    // Auto-rotate the ENTIRE group (model + hotspots together)
    if (rotatingGroupRef.current && autoRotate && !editMode) {
      rotatingGroupRef.current.rotation.y += rotationSpeed
    }

    // Animate spotlight to follow mouse
    if (!light.current) return
    easing.damp3(
      light.current.position,
      [5 + state.pointer.x * 3, 5 + state.pointer.y * 2, 5 + state.pointer.y * 2],
      0.2,
      delta
    )
  })

  return (
    <group>
      {/* Rotating group - contains model AND hotspots so they rotate together */}
      <group ref={rotatingGroupRef}>
        {/* The 3D Model */}
        <primitive ref={modelRef} object={clonedScene} />
        
        {/* Hotspot annotations - inside rotating group */}
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
      
      {/* Dynamic spotlight - outside rotating group */}
      <spotLight
        ref={light}
        intensity={1}
        angle={0.5}
        penumbra={0.5}
        position={[5, 5, 5]}
        castShadow
        shadow-mapSize={1024}
      />
    </group>
  )
}

// =============================================================================
// SCENE CLICK HANDLER - Raycasting for hotspot positioning
// =============================================================================
interface SceneClickHandlerProps {
  enabled: boolean
  onPositionUpdate: (x: number, y: number, z: number) => void
}

function SceneClickHandler({ enabled, onPositionUpdate }: SceneClickHandlerProps) {
  const { camera, scene, gl } = useThree()

  useEffect(() => {
    if (!enabled) return

    const handleClick = (event: MouseEvent) => {
      const canvas = gl.domElement
      const rect = canvas.getBoundingClientRect()
      
      // Convert to normalized device coordinates
      const mouse = new THREE.Vector2()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Raycast
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, camera)

      // Find all mesh objects in scene
      const meshes: THREE.Object3D[] = []
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          meshes.push(obj)
        }
      })

      const intersects = raycaster.intersectObjects(meshes, true)
      
      if (intersects.length > 0) {
        const point = intersects[0].point
        onPositionUpdate(point.x, point.y, point.z)
      }
    }

    gl.domElement.addEventListener('click', handleClick)
    return () => gl.domElement.removeEventListener('click', handleClick)
  }, [enabled, camera, scene, gl, onPositionUpdate])

  return null
}

// =============================================================================
// LOADING COMPONENT
// =============================================================================
function Loader() {
  return (
    <Html center>
      <div className="loader">
        <div className="loader-spinner" />
        <p>Loading 3D Model...</p>
      </div>
    </Html>
  )
}

// =============================================================================
// FIXED HOTSPOT PANEL - Edit Mode Sidebar
// =============================================================================
interface FixedHotspotPanelProps {
  hotspots: HotspotData[]
  editingHotspot: string | null
  onSelectHotspot: (id: string) => void
  onAddHotspot: () => void
  onDeleteHotspot: (id: string) => void
  onUpdatePosition: (id: string, axis: 'x' | 'y' | 'z', value: number) => void
  onUpdateTitle: (id: string, title: string) => void
  onUpdateDescription: (id: string, description: string) => void
}

function FixedHotspotPanel({
  hotspots,
  editingHotspot,
  onSelectHotspot,
  onAddHotspot,
  onDeleteHotspot,
  onUpdatePosition,
  onUpdateTitle,
  onUpdateDescription
}: FixedHotspotPanelProps) {
  const currentHotspot = hotspots.find(h => h.id === editingHotspot)

  return (
    <div className="fixed-hotspot-panel">
      <div className="panel-header">
        <h3>🎯 Hotspot Editor</h3>
        <button className="add-btn" onClick={onAddHotspot}>
          + Add Hotspot
        </button>
      </div>

      <div className="hotspot-list">
        {hotspots.map((hotspot) => (
          <div
            key={hotspot.id}
            className={`hotspot-item ${editingHotspot === hotspot.id ? 'selected' : ''}`}
            onClick={() => onSelectHotspot(hotspot.id)}
          >
            <span className="hotspot-title">{hotspot.title}</span>
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteHotspot(hotspot.id)
              }}
            >
              ×
            </button>
          </div>
        ))}
        {hotspots.length === 0 && (
          <p className="empty-message">No hotspots yet. Click "Add Hotspot" to create one.</p>
        )}
      </div>

      {currentHotspot && (
        <div className="hotspot-editor">
          <h4>Edit: {currentHotspot.title}</h4>
          
          <div className="editor-field">
            <label>Title</label>
            <input
              type="text"
              value={currentHotspot.title}
              onChange={(e) => onUpdateTitle(currentHotspot.id, e.target.value)}
            />
          </div>

          <div className="editor-field">
            <label>Description</label>
            <textarea
              value={currentHotspot.description}
              onChange={(e) => onUpdateDescription(currentHotspot.id, e.target.value)}
              rows={3}
            />
          </div>

          <div className="position-editor">
            <h5>Position (Click model to place)</h5>
            
            {(['x', 'y', 'z'] as const).map((axis, idx) => (
              <div className="axis-control" key={axis}>
                <label>{axis.toUpperCase()}</label>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.01"
                  value={currentHotspot.position[idx]}
                  onChange={(e) => onUpdatePosition(currentHotspot.id, axis, parseFloat(e.target.value))}
                />
                <input
                  type="number"
                  step="0.01"
                  value={currentHotspot.position[idx].toFixed(2)}
                  onChange={(e) => onUpdatePosition(currentHotspot.id, axis, parseFloat(e.target.value))}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// HOTSPOT INFO PANEL - Display panel on click
// =============================================================================
interface HotspotInfoPanelProps {
  hotspot: HotspotData
  onClose: () => void
}

function HotspotInfoPanel({ hotspot, onClose }: HotspotInfoPanelProps) {
  return (
    <div className="hotspot-info-panel">
      <button className="close-btn" onClick={onClose}>×</button>
      <h3>{hotspot.title}</h3>
      <p>{hotspot.description}</p>
    </div>
  )
}

// =============================================================================
// SAVE CONFIGURATION PANEL
// =============================================================================
interface SaveConfigurationPanelProps {
  savedConfigs: SavedConfiguration[]
  onSave: (name: string) => void
  onLoad: (config: SavedConfiguration) => void
  onDelete: (id: string) => void
  onClose: () => void
}

function SaveConfigurationPanel({
  savedConfigs,
  onSave,
  onLoad,
  onDelete,
  onClose
}: SaveConfigurationPanelProps) {
  const [saveName, setSaveName] = useState('')

  return (
    <div className="save-panel-overlay">
      <div className="save-panel">
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>💾 Save / Load Configuration</h3>
        
        <div className="save-section">
          <h4>Save Current</h4>
          <div className="save-input-group">
            <input
              type="text"
              placeholder="Configuration name..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <button 
              onClick={() => {
                if (saveName.trim()) {
                  onSave(saveName.trim())
                  setSaveName('')
                }
              }}
              disabled={!saveName.trim()}
            >
              Save
            </button>
          </div>
        </div>

        <div className="load-section">
          <h4>Saved Configurations</h4>
          {savedConfigs.length === 0 ? (
            <p className="empty-message">No saved configurations yet.</p>
          ) : (
            <div className="config-list">
              {savedConfigs.map((config) => (
                <div key={config.id} className="config-item">
                  <div className="config-info">
                    <span className="config-name">{config.name}</span>
                    <span className="config-date">
                      {new Date(config.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="config-actions">
                    <button onClick={() => onLoad(config)}>Load</button>
                    <button className="delete" onClick={() => onDelete(config.id)}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN MODEL VIEWER COMPONENT
// =============================================================================
interface ModelViewerProps {
  modelPath?: string
  modelId?: string
}

export default function ModelViewer({ 
  modelPath = '/sample-model.glb',
  modelId = 'default'
}: ModelViewerProps) {
  // State management
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [saveMode, setSaveMode] = useState(false)
  const [editingHotspot, setEditingHotspot] = useState<string | null>(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const [rotationSpeed, setRotationSpeed] = useState(0.005)
  
  // Hotspot data
  const [hotspots, setHotspots] = useState<HotspotData[]>([
    {
      id: 'demo-1',
      position: [0, 1, 0],
      title: 'Feature Point',
      description: 'This is an interactive hotspot. Click on the model in edit mode to reposition it.'
    }
  ])

  // Saved configurations
  const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>(() => {
    const stored = localStorage.getItem('model-viewer-configs')
    return stored ? JSON.parse(stored) : []
  })

  // Save to localStorage when configs change
  useEffect(() => {
    localStorage.setItem('model-viewer-configs', JSON.stringify(savedConfigs))
  }, [savedConfigs])

  // Hotspot management functions
  const addHotspot = useCallback(() => {
    const newHotspot: HotspotData = {
      id: `hotspot-${Date.now()}`,
      position: [0, 0.8, 0],
      title: `Hotspot ${hotspots.length + 1}`,
      description: 'Click on the model to position this hotspot.'
    }
    setHotspots(prev => [...prev, newHotspot])
    setEditingHotspot(newHotspot.id)
  }, [hotspots.length])

  const deleteHotspot = useCallback((id: string) => {
    setHotspots(prev => prev.filter(h => h.id !== id))
    if (editingHotspot === id) setEditingHotspot(null)
    if (activeHotspot === id) setActiveHotspot(null)
  }, [editingHotspot, activeHotspot])

  const updateHotspotPosition = useCallback((id: string, axis: 'x' | 'y' | 'z', value: number) => {
    setHotspots(prev => prev.map(h => {
      if (h.id !== id) return h
      const newPosition: [number, number, number] = [...h.position]
      const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
      newPosition[axisIndex] = value
      return { ...h, position: newPosition }
    }))
  }, [])

  const updateHotspotTitle = useCallback((id: string, title: string) => {
    setHotspots(prev => prev.map(h => 
      h.id === id ? { ...h, title } : h
    ))
  }, [])

  const updateHotspotDescription = useCallback((id: string, description: string) => {
    setHotspots(prev => prev.map(h => 
      h.id === id ? { ...h, description } : h
    ))
  }, [])

  // Scene click handler for hotspot positioning
  const handleScenePositionUpdate = useCallback((x: number, y: number, z: number) => {
    if (!editingHotspot) return
    setHotspots(prev => prev.map(h => 
      h.id === editingHotspot ? { ...h, position: [x, y, z] } : h
    ))
  }, [editingHotspot])

  // Hotspot click handler
  const handleHotspotClick = useCallback((id: string) => {
    if (editMode) {
      setEditingHotspot(id)
    } else {
      setActiveHotspot(id)
    }
  }, [editMode])

  // Configuration save/load
  const saveConfiguration = useCallback((name: string) => {
    const config: SavedConfiguration = {
      id: `config-${Date.now()}`,
      name,
      timestamp: Date.now(),
      hotspots: [...hotspots],
      modelId
    }
    setSavedConfigs(prev => [...prev, config])
  }, [hotspots, modelId])

  const loadConfiguration = useCallback((config: SavedConfiguration) => {
    setHotspots(config.hotspots)
    setSaveMode(false)
    setEditingHotspot(null)
    setActiveHotspot(null)
  }, [])

  const deleteConfiguration = useCallback((id: string) => {
    setSavedConfigs(prev => prev.filter(c => c.id !== id))
  }, [])

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setEditMode(prev => {
      if (prev) {
        setEditingHotspot(null)
      }
      return !prev
    })
    setActiveHotspot(null)
  }, [])

  return (
    <div className={`model-viewer ${editMode ? 'edit-mode' : ''}`}>
      {/* Control bar */}
      <div className="control-bar">
        <div className="control-group">
          <button 
            className={`control-btn ${editMode ? 'active' : ''}`}
            onClick={toggleEditMode}
          >
            {editMode ? '✓ Exit Edit Mode' : '✏️ Edit Mode'}
          </button>
          <button 
            className="control-btn"
            onClick={() => setSaveMode(true)}
          >
            💾 Save/Load
          </button>
        </div>

        <div className="control-group">
          <button
            className={`control-btn ${autoRotate ? 'active' : ''}`}
            onClick={() => setAutoRotate(!autoRotate)}
          >
            {autoRotate ? '⏸ Pause Rotation' : '▶ Resume Rotation'}
          </button>
          <div className="speed-control">
            <label>Speed</label>
            <input
              type="range"
              min="0"
              max="0.02"
              step="0.001"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [5, 3, 5], fov: 50 }}
        className="canvas-container"
      >
        <color attach="background" args={['#0a0a0f']} />
        
        <Suspense fallback={<Loader />}>
          {/* Render DemoModel for demo mode, or actual GLTF model */}
          {modelPath === '__demo__' ? (
            <DemoModel
              hotspots={hotspots}
              activeHotspot={activeHotspot}
              editingHotspot={editingHotspot}
              autoRotate={autoRotate && !editMode}
              rotationSpeed={rotationSpeed}
              onHotspotClick={handleHotspotClick}
            />
          ) : (
            <Model
              modelPath={modelPath}
              hotspots={hotspots}
              activeHotspot={activeHotspot}
              editingHotspot={editingHotspot}
              editMode={editMode}
              autoRotate={autoRotate}
              rotationSpeed={rotationSpeed}
              onHotspotClick={handleHotspotClick}
            />
          )}
          
          <SceneClickHandler
            enabled={editMode && editingHotspot !== null}
            onPositionUpdate={handleScenePositionUpdate}
          />

          {/* Environment and lighting */}
          <Environment preset="city" />
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1} 
            castShadow 
          />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          
          {/* Ground shadow */}
          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.5}
            scale={20}
            blur={2}
            far={4}
          />
        </Suspense>

        <CameraControls
          minDistance={2}
          maxDistance={15}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2 + 0.5}
        />
      </Canvas>

      {/* Edit mode sidebar */}
      {editMode && (
        <FixedHotspotPanel
          hotspots={hotspots}
          editingHotspot={editingHotspot}
          onSelectHotspot={setEditingHotspot}
          onAddHotspot={addHotspot}
          onDeleteHotspot={deleteHotspot}
          onUpdatePosition={updateHotspotPosition}
          onUpdateTitle={updateHotspotTitle}
          onUpdateDescription={updateHotspotDescription}
        />
      )}

      {/* Info panel (non-edit mode) */}
      {!editMode && activeHotspot && (
        <HotspotInfoPanel
          hotspot={hotspots.find(h => h.id === activeHotspot)!}
          onClose={() => setActiveHotspot(null)}
        />
      )}

      {/* Save/Load panel */}
      {saveMode && (
        <SaveConfigurationPanel
          savedConfigs={savedConfigs}
          onSave={saveConfiguration}
          onLoad={loadConfiguration}
          onDelete={deleteConfiguration}
          onClose={() => setSaveMode(false)}
        />
      )}

      {/* Edit mode instructions */}
      {editMode && editingHotspot && (
        <div className="edit-instructions">
          Click on the 3D model to position the selected hotspot
        </div>
      )}
    </div>
  )
}

// Note: Preload your models here for better performance
// useGLTF.preload('/your-model.glb')

