# 🏪 Second Life Pawn

> **AI-Powered Appraisals** — A 3D pawn shop experience with multi-voice AI experts

[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Conversational_AI-blueviolet?style=for-the-badge)](https://elevenlabs.io)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js)](https://threejs.org)

---

## 👥 Team

| Name | Role |
|------|------|
| **Ward De Muynck** | Developer |
| **Wolfgang Riegler** | Developer |
| **Zakaria Chahbar** | Developer |

---

## 💡 The Concept

Walk into a virtual pawn shop. Before you sits a beautiful **1960s Danish lounge chair**. 

You want to know more — but who do you ask?

**Four AI experts are ready to help:**

| 🎩 **Host** | 🔧 **Technical Tony** | 📜 **Historical Emma** | 💰 **Financial Frank** |
|-------------|----------------------|------------------------|------------------------|
| Welcomes you | Materials & construction | Provenance & story | Value & market |

**One ElevenLabs agent. Four distinct voices. Ask anything.**

---

## ✨ Features

- **🪑 Interactive 3D Viewer** — Rotate, zoom, and explore the chair model
- **🎤 Voice Conversation** — Talk naturally with AI experts via ElevenLabs
- **⌨️ Text Input** — Type questions if you prefer
- **🎯 Smart Routing** — Questions automatically go to the right expert
- **📍 Interactive Hotspots** — Click points of interest on the model
- **💾 Save Configurations** — Preserve your hotspot setups

---

## 🚀 Quick Start

```bash
# Clone & install
git clone https://github.com/flybylow/11labsHack.git
cd 11labsHack
npm install

# Configure ElevenLabs (create .env file)
echo "VITE_ELEVENLABS_AGENT_ID=your-agent-id" > .env
echo "VITE_ELEVENLABS_API_KEY=your-api-key" >> .env

# Run
npm run dev
```

Open **http://localhost:5173**

---

## 🎮 How It Works

1. **View the Chair** — Model auto-rotates; use mouse to orbit/zoom
2. **Click 🎤 Start** — Connects to ElevenLabs voice AI
3. **Ask Questions** — Speak or type:

| You Ask... | Expert Responds |
|------------|-----------------|
| *"What's this made of?"* | 🔧 Tony explains the materials |
| *"Where did this come from?"* | 📜 Emma tells its story |
| *"How much is it worth?"* | 💰 Frank gives the valuation |
| *"Tell me about this chair"* | 🎩 Host gives an overview |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript** | Type Safety |
| **React Three Fiber** | 3D Rendering |
| **@react-three/drei** | 3D Helpers |
| **ElevenLabs React SDK** | Voice AI |
| **Vite** | Build Tool |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ModelViewer.tsx          # 3D viewer + hotspots
│   ├── PawnShopConversation.tsx # ElevenLabs voice integration
│   ├── DemoModel.tsx            # Fallback demo scene
│   └── ErrorBoundary.tsx        # Error handling
├── App.tsx                      # Main app layout
└── types.ts                     # TypeScript interfaces

public/
└── CHAIR/                       # 3D model assets (GLTF)

docs/
├── ELEVENLABS_SETUP.md          # Agent configuration guide
└── DEVELOPER_GUIDE.md           # Technical documentation
```

---

## 🔧 ElevenLabs Setup

See [`docs/ELEVENLABS_SETUP.md`](docs/ELEVENLABS_SETUP.md) for full instructions.

**Quick version:**
1. Create agent at [elevenlabs.io/app/conversational-ai](https://elevenlabs.io/app/conversational-ai)
2. Enable multi-voice with labels: `Tony`, `Emma`, `Frank`
3. Copy Agent ID and API Key to `.env`

---

## 📄 License

MIT — Built for the **ElevenLabs AI Agents Hackathon** 🎯

---

<p align="center">
  <strong>🏪 Second Life Pawn</strong><br>
  <em>Where every item has a story to tell</em>
</p>
