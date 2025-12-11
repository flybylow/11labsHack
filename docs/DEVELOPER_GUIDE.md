# 3D Model Viewer - Developer Guide

> A complete interactive 3D model viewer with hotspots, auto-rotation, and annotation support built with React Three Fiber.

---

## 🎯 Features Implemented

| Feature | Status | Description |
|---------|--------|-------------|
| 3D Viewer | ✅ | Load and display GLTF/GLB models |
| Multiple Models | ✅ | Switch between different 3D models via dropdown |
| Auto-Rotation | ✅ | Model continuously rotates around Y-axis |
| Rotation Controls | ✅ | Pause/Resume and speed adjustment |
| 3D Hotspots | ✅ | Interactive markers positioned in 3D space |
| Hotspot Click → Panel | ✅ | Clicking hotspots displays information panels |
| Edit Mode | ✅ | Sidebar panel for managing hotspots |
| Click-to-Position | ✅ | Click on model to place hotspots |
| XYZ Position Editing | ✅ | Sliders and numeric inputs for fine-tuning |
| Title/Description Editing | ✅ | Edit hotspot content |
| Save/Load Configurations | ✅ | Persist to localStorage |
| Demo Scene | ✅ | Built-in demo when no model is provided |

---

## 📐 Architecture

### Tech Stack
- **React 19** + **TypeScript**
- **React Three Fiber** (`@react-three/fiber`)
- **@react-three/drei** - Helpers (useGLTF, Html, CameraControls)
- **Three.js** - 3D graphics engine
- **maath** - Math utilities (easing)
- **Vite** - Build tool

### Component Hierarchy

```
App.tsx
└── ModelViewer.tsx (main component)
    ├── Canvas (React Three Fiber)
    │   ├── Model / DemoModel (3D scene)
    │   │   ├── primitive/meshes (3D geometry)
    │   │   └── Annotation[] (hotspot markers)
    │   ├── SceneClickHandler (edit mode raycasting)
    │   ├── Environment, Lights, ContactShadows
    │   └── CameraControls
    ├── FixedHotspotPanel (edit mode sidebar)
    ├── HotspotInfoPanel (info display)
    └── SaveConfigurationPanel (save/load modal)
```

---

## 📁 File Structure

```
src/
├── App.tsx                    # Model selector + routing
├── App.css                    # App styles
├── main.tsx                   # Entry point
├── index.css                  # Global styles
├── types.ts                   # TypeScript interfaces
└── components/
    ├── ModelViewer.tsx        # Main 3D viewer component
    ├── ModelViewer.css        # Viewer styles
    ├── DemoModel.tsx          # Built-in demo scene
    └── ErrorBoundary.tsx      # Error handling

public/
└── (your 3D models go here)
```

---

## 🔑 Data Structures

### HotspotData
```typescript
interface HotspotData {
  id: string                          // Unique identifier
  position: [number, number, number]  // 3D coordinates [x, y, z]
  title: string                       // Display title
  description: string                 // Info panel content
}
```

### ModelConfig
```typescript
interface ModelConfig {
  id: string
  name: string
  path: string  // Path relative to /public, or '__demo__' for demo scene
}
```

### SavedConfiguration
```typescript
interface SavedConfiguration {
  id: string
  name: string
  timestamp: number
  hotspots: HotspotData[]
  modelId: string
}
```

---

## 🚀 Quick Start

### 1. Run the Development Server
```bash
npm run dev
```

### 2. Add Your Own Models

Place GLTF/GLB files in the `/public` folder, then update `src/App.tsx`:

```typescript
const MODELS: ModelConfig[] = [
  {
    id: 'demo',
    name: '✨ Demo Scene (Built-in)',
    path: '__demo__'
  },
  // Add your models:
  {
    id: 'outdoor',
    name: 'Outdoor Table Set',
    path: '/outdoor_table_chair_set_01_4k.blend/outdoor_table_chair_set_01_4k.gltf'
  },
  {
    id: 'lounge',
    name: 'Mid-Century Lounge Chair',
    path: '/mid/century_lounge_chair_4k.glb'
  },
]
```

### 3. Free 3D Model Sources
- [Poly Haven](https://polyhaven.com/models) - High quality, CC0 licensed
- [Sketchfab](https://sketchfab.com) - Various licenses
- [Mixamo](https://mixamo.com) - Animated characters

---

## 🎨 Feature Details

### Auto-Rotation
- Enabled by default
- Pauses automatically in Edit Mode
- Adjustable speed via slider (0 to 0.02 radians/frame)

### Edit Mode
1. Click "Edit Mode" button
2. Click "+ Add Hotspot" to create new hotspot
3. Select hotspot from list
4. Click on 3D model to position
5. Use sliders/inputs for fine-tuning
6. Edit title and description
7. Click "Exit Edit Mode" when done

### Hotspot Interactions
- **View Mode**: Click hotspot → Info panel appears
- **Edit Mode**: Click hotspot → Select for editing

### Camera Controls
- **Orbit**: Click and drag
- **Zoom**: Scroll wheel
- **Pan**: Right-click and drag

---

## 🎬 User Flows

### View Model with Hotspots
1. App loads → Demo scene or selected model displays
2. Model auto-rotates
3. User sees hotspot annotations
4. User clicks hotspot → Info panel appears
5. User reads info → Clicks × → Panel closes

### Add New Hotspot
1. User clicks "Edit Mode"
2. User clicks "+ Add Hotspot"
3. New hotspot appears at default position
4. User clicks on model → Hotspot moves
5. User adjusts position with sliders
6. User edits title/description
7. User exits edit mode

### Save/Load Configuration
1. Click "Save/Load" button
2. Enter configuration name
3. Click "Save"
4. Configuration persists to localStorage
5. Load saved configuration anytime

---

## 🛠️ Customization

### Change Background Color
In `ModelViewer.tsx`, modify the Canvas:
```tsx
<Canvas>
  <color attach="background" args={['#your-color']} />
  ...
</Canvas>
```

### Adjust Camera Position
```tsx
<Canvas camera={{ position: [5, 3, 5], fov: 50 }}>
```

### Modify Hotspot Styling
Edit `.annotation` classes in `ModelViewer.css`

### Add Custom Lighting
```tsx
<ambientLight intensity={0.3} />
<directionalLight position={[10, 10, 5]} intensity={1} />
<spotLight position={[5, 5, 5]} angle={0.5} penumbra={0.5} />
```

---

## 🐛 Troubleshooting

### Model Not Loading
- Check file path is correct relative to `/public`
- Ensure GLTF file references (textures, .bin) are included
- Check browser console for errors

### Hotspots Not Visible
- Verify position is within camera view
- Adjust Y position if occluded by model
- Check `hotspots` array has data

### Auto-Rotation Not Working
- Ensure `autoRotate` state is true
- Exit edit mode (rotation pauses in edit mode)
- Check browser console for errors

### Click-to-Position Not Working
- Ensure edit mode is ON
- Select a hotspot first (green highlight)
- Click directly on the 3D model mesh

---

## 📝 Notes

- **Model Format**: Supports GLTF (.gltf) and GLB (.glb)
- **Hotspots**: Use HTML elements positioned in 3D space
- **Persistence**: Configurations saved to localStorage
- **Performance**: Models are cloned to prevent mutation
- **Camera**: Independent of model rotation

---

*Built with React Three Fiber + Three.js*

