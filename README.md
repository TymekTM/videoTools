<div align="center">

# Video Tools

**A desktop creative suite for generating cinematic video content — article highlights, chat animations, typing effects, map routes, animated charts, push notifications, and green-screen matting.**

Built with Electron + FFmpeg.

> **Note:** The app UI is currently in **Polish**. An **English** version is planned for the future.

[![Electron](https://img.shields.io/badge/Electron-28-47848C?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-static-007808?logo=ffmpeg&logoColor=white)](https://ffmpeg.org/)

</div>

---

## Features

### Newspaper / Article Renderer
Generate realistic article pages with **keyword highlighting**, zoom, pan, and Ken Burns animations. Choose from 20+ newspaper templates (NYT, Guardian, Le Monde, Seznam, and more) with custom accent colors, vignette, and smooth easing presets. Export as MP4, MOV (ProRes), or WebM.

### Chat Mockup
Create iMessage, WhatsApp, Messenger, Telegram, and custom chat conversations with bubble animations, avatar support, typing indicators, and per-contact colors.

### Typing Animation
Simulate realistic typing in a code editor, terminal, email client, or SMS bubble — with delete, pause, newline, and customizable speeds.

### Map Route Animator
Build animated map routes with Leaflet.js. Pick from plane, car, ship, or train icons, follow/overview camera modes, dark/light/topo tile styles, and export the journey as video.

### Animated Charts
Render bar, line, pie/donut, area, gauge, and counter charts with eased animations, stagger effects, custom palettes, and canvas-based export.

### Push Notifications
Design iOS/Android push notification sequences — Instagram, X, TikTok, WhatsApp, Telegram, and more — with slide-in/fade-out animations and stackable layouts.

### CorridorKey Integration
Built-in GUI for [CorridorKey](https://github.com/nikopueringer/CorridorKey) — AI-powered green-screen matting. Clone the repo, download models, extract frames, generate alpha mattes (BiRefNet / Green Video Mama), run inference, and assemble the final video — all from the app.

---

## Screenshots

*(Coming soon)*

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Python](https://python.org/) 3.10+ + [uv](https://github.com/astral-sh/uv) *(for CorridorKey)*
- NVIDIA GPU + CUDA *(optional, for faster matting)*

### Install

```bash
git clone https://github.com/your-user/videoTools.git
cd videoTools
npm install
```

### Run

```bash
npm start
```

---

## Export Formats

| Format | Codec | Use Case |
|--------|-------|----------|
| **MP4** | H.264 | Web, social media |
| **MOV** | Apple ProRes 4444 | Premiere / After Effects (with alpha) |
| **WebM** | VP9 (with alpha) | Web with transparency |

---

## Project Structure

```
videoTools/
├── main.js                        # Electron main process — IPC, FFmpeg, BG rendering
├── package.json
├── scripts/
│   └── birefnet_alpha.py          # BiRefNet alpha matte generation
└── src/
    ├── index.html                 # App shell
    ├── base.css                   # Shared styles & theming
    ├── shared.js                  # Utilities & resolution presets
    ├── renderer.js                # Core nav & theme logic
    ├── templates.js               # 20+ newspaper template definitions
    ├── news-renderer.js           # Article tool (zoom, pan, export)
    ├── chat-renderer.js           # Chat mockup tool
    ├── typing-renderer.js         # Typing animation tool
    ├── map-renderer.js            # Map route animation tool
    ├── chart-renderer.js          # Animated chart tool
    ├── notification-renderer.js   # Push notification tool
    ├── corridorkey-renderer.js    # CorridorKey green-screen workflow
    └── *.css                      # Per-tool stylesheets
```

---

## Architecture

The app uses an **offscreen BrowserWindow** pipeline for frame-perfect rendering:

1. A hidden Electron window renders each frame at full resolution
2. Frames are captured via `webContents.capturePage()`
3. Written to a temp directory as JPEG/PNG
4. FFmpeg encodes them into the final video

This approach allows pixel-perfect HTML/CSS rendering with Google Fonts, SVG, canvas, and Leaflet maps — all without a headless browser dependency.

---

## Tech Stack

- **Electron 28** — desktop shell
- **FFmpeg** (static binary) — video encoding
- **Leaflet.js** — map tiles & routing
- **Canvas API** — chart rendering
- **BiRefNet** (via Python/uv) — AI matting

---

## License

Private project. All rights reserved.
