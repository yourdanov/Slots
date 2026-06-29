# 🎰 Your Slots

A state-of-the-art, premium slot machine game built using **React, HTML5 Canvas, and Electron**. Designed with rich aesthetics, custom animation physics, real-time analytical charting, procedural audio synthesis, and multi-user profile management.

Created by **Atanas Youdanov**.

---

## 🚀 Key Features

*   **Symmetrical 3-Column Cabinet Layout**: Built as a responsive dashboard matching physical video-slot cabinets. Includes an active Spin History ledger (left), the Reels screen and progressive jackpot (center), and Account Balance controls (right).
*   **Canvas Reel Physics & Blur**: Custom rendering loop utilizing requestAnimationFrame to calculate reel acceleration, top speed, friction deceleration, and elastic bounce-backs. Employs speed-based motion blur sweeps for realistic slot spins.
*   **Emoji Symbols Scaling**: Corrected canvas render font stacks (using standard system fonts like `Segoe UI Emoji`) to draw beautiful, vibrant emojis at full scale (54px) with custom theme-specific glowing shadows.
*   **Procedural Audio Synthesizer**: Generates all game sound effects (button clicks, spin sweeps, reel locks, win arpeggios, and jackpot alarms) on the fly using browser Web Audio API oscillators. Requires zero external audio file downloads.
*   **Multi-User Career Management**: Save and switch between custom player profiles saved persistently in LocalStorage. Track career spin counts, lifetime winnings, and customize avatars.
*   **Canvas Analytics Charts**: An interactive statistics tab that draws real-time balance trend lines and win distribution pie charts on canvas.
*   **4 Visual Themes**: Switch styles instantly with dedicated palettes and symbol sets:
    1.  **Vegas Classic**: Deep casino felt green with golden accents.
    2.  **Cyber Neon**: Futuristic synthwave pink, violet, and cyan glow.
    3.  **Ancient Egypt**: Warm papyrus colors with Egyptian mythology icons.
    4.  **Crypto Gold**: Dark blockchain theme with crypto-currency coins.
*   **Standalone Desktop Wrapper**: Compiled as a native Windows application executable (`.exe`) running offline in a customized Electron container.

---

## 📂 Repository Structure

The codebase is organized as follows:

```
Slots/
├── README.md               # Main project documentation (this file)
└── web/                    # React Web & Desktop App Workspace
    ├── dist/               # Compiled Web Production Build
    ├── dist-desktop/       # Standalone Windows Executables
    │   └── Your Slots-win32-x64/
    │       └── Your Slots.exe   # Double-click to play!
    ├── electron-main.cjs   # Electron runtime configuration & window wrapper
    ├── package.json        # Node dependency configurations & build scripts
    ├── vite.config.js      # Vite compiler relative base path settings
    └── src/                # Frontend Source Code
        ├── main.jsx        # App entry point
        ├── index.css       # Layout classes, themes, and micro-animations
        ├── utils/
        │   └── AudioEngine.js   # Web Audio oscillator synthesizer
        └── components/
            ├── ReelsCanvas.jsx  # Physics-driven slot reel engine
            ├── ControlPanel.jsx  # Wagers, paylines, and Auto Spin triggers
            ├── HistoryTable.jsx  # Monospaced scrollable history table
            ├── StatsDashboard.jsx# Real-time analytics charts canvas
            ├── ProfileManager.jsx# Profile creator & avatar selector
            └── PaytableModal.jsx # Game rules & paylines guide
```

---

## 🛠️ Installation & Setup

To run or build the project on your local machine, make sure you have [Node.js](https://nodejs.org/) installed.

### 1. Install Dependencies
Open a terminal in the `web/` directory and run:
```bash
cd web
npm install
```

### 2. Run Local Development Server
To run the hot-reloading development server:
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:5173/`**.

### 3. Build & Package Desktop Application
To compile your React source files and package them into a native Windows `.exe` desktop application:
```bash
npm run build:desktop
```
The output directory will be generated at:
📂 `web/dist-desktop/Your Slots-win32-x64/`

Inside, double-click **`Your Slots.exe`** to play the game offline!

---

## 📄 License & Credits
Developed and designed with visual excellence by **Atanas Youdanov**. All rights reserved © 2026.
