import { useState, Suspense } from 'react'
import ModelViewer from './components/ModelViewer'
import ErrorBoundary from './components/ErrorBoundary'
import { PawnShopConversation } from './components/PawnShopConversation'
import type { ModelConfig } from './types'
import './App.css'

// Model configurations
const MODELS: ModelConfig[] = [
  {
    id: 'lounge-chair',
    name: '1960s Danish Chair',
    path: '/CHAIR/mid_century_lounge_chair_4k.gltf'
  },
  {
    id: 'demo',
    name: '✨ Demo Scene',
    path: '__demo__'
  },
]

function App() {
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(MODELS[0])

  return (
    <div className="app pawnshop-theme">
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🏪</span>
          <div className="logo-text">
            <h1>Second Life Pawn</h1>
            <span className="tagline">AI-Powered Appraisals</span>
          </div>
        </div>
        
        <div className="model-selector">
          <label htmlFor="model-select">Item:</label>
          <select
            id="model-select"
            value={selectedModel.id}
            onChange={(e) => {
              const model = MODELS.find(m => m.id === e.target.value)
              if (model) setSelectedModel(model)
            }}
          >
            {MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main viewer */}
      <main className="app-main">
        <ErrorBoundary
          fallback={
            <div className="error-fallback">
              <h2>⚠️ Failed to load model</h2>
              <p>Make sure {selectedModel.path} exists in the public folder.</p>
            </div>
          }
        >
          <Suspense fallback={
            <div className="loading-screen">
              <div className="loading-spinner" />
              <p>Loading 3D Model...</p>
            </div>
          }>
            <ModelViewer 
              modelPath={selectedModel.path}
              modelId={selectedModel.id}
            />
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Bottom Voice Bar */}
      <PawnShopConversation />
    </div>
  )
}

export default App
