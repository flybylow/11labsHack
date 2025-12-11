// Hotspot data structure for 3D annotations
export interface HotspotData {
  id: string
  position: [number, number, number]
  title: string
  description: string
}

// Model configuration for the model selector
export interface ModelConfig {
  id: string
  name: string
  path: string
}

// Saved configuration for localStorage persistence
export interface SavedConfiguration {
  id: string
  name: string
  timestamp: number
  hotspots: HotspotData[]
  modelId: string
}

