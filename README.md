# Second Life Pawn - AI Expert Panel Demo

Interactive 3D pawn shop with multi-voice AI experts powered by ElevenLabs.

![ElevenLabs](https://img.shields.io/badge/ElevenLabs-AI%20Agents-blueviolet) ![React](https://img.shields.io/badge/React-19-blue) ![Three.js](https://img.shields.io/badge/Three.js-r169-green)

## ✨ The Concept

A 1960s Danish chair in a pawn shop. Four AI experts give their perspective:

| Expert | 🎩 Host | 🔧 Technical Tony | 📜 Historical Emma | 💰 Financial Frank |
|--------|---------|-------------------|--------------------|--------------------|
| **Focus** | Introduction | Materials & specs | Provenance & story | Value & market |

One ElevenLabs agent, multiple voices. Ask questions, the right expert responds.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set your ElevenLabs Agent ID
# In src/components/PawnShopConversation.tsx, update AGENT_ID

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 🎮 Usage

1. **View the Chair** - 3D model auto-rotates with camera controls
2. **Start Conversation** - Click 🎤 to connect to ElevenLabs
3. **Ask Questions** - Speak or type:
   - *"What's it made of?"* → Tony explains materials
   - *"Where has it been?"* → Emma tells the story
   - *"What's it worth?"* → Frank gives the value
4. **Edit Hotspots** - Click Edit Mode to add/position markers

## 📖 Documentation

- `/docs/ELEVENLABS_SETUP.md` - Complete agent configuration guide
- `/docs/DEVELOPER_GUIDE.md` - 3D viewer technical documentation

## 🎯 Features

- **3D Model Viewer** - React Three Fiber with GLTF support
- **Auto-Rotation** - Continuous rotation with speed control
- **Interactive Hotspots** - 3D positioned annotations
- **ElevenLabs Integration** - Multi-voice AI conversation
- **Character Routing** - Automatic expert selection based on question
- **Voice + Text** - Speak or type your questions

## 🛠️ Tech Stack

- React 19 + TypeScript
- React Three Fiber + Drei
- ElevenLabs React SDK
- Vite

## 📁 Project Structure

```
src/
├── components/
│   ├── ModelViewer.tsx         # 3D viewer with hotspots
│   ├── PawnShopConversation.tsx # ElevenLabs integration
│   ├── DemoModel.tsx           # Built-in demo scene
│   └── ErrorBoundary.tsx
├── App.tsx                     # Main layout
└── types.ts                    # TypeScript interfaces

public/
└── CHAIR/                      # 1960s Danish chair model
```

---

Built for **ElevenLabs AI Agents Hackathon** 🎯
