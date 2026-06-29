import React, { useRef, useEffect } from 'react';
import audioEngine from '../utils/AudioEngine';

// Symbol configurations for each theme
export const THEME_SYMBOLS = {
  vegas: {
    list: ['🍒', '🍋', '🍇', '🍀', '♠', '🔔', '♦', '7', '🌟', '👑'],
    colors: {
      '🍒': '#ff4d4d', '🍋': '#ffe066', '🍇': '#d633ff', '🍀': '#33cc33',
      '♠': '#ffffff', '🔔': '#ffd700', '♦': '#ff3333', '7': '#ff0000',
      '🌟': '#00ffff', '👑': '#ffcc00'
    },
    label: 'Vegas Classic'
  },
  cyber: {
    list: ['💖', '📼', '🕶️', '🤖', '🔑', '⚡', '🧊', '💎', '⚡', '💿'],
    colors: {
      '💖': '#ff007f', '📼': '#9d4edd', '🕶️': '#00f0ff', '🤖': '#3a86c8',
      '🔑': '#ffd166', '⚡': '#ffbc42', '🧊': '#a2d2ff', '💎': '#00f5d4',
      '💿': '#f72585'
    },
    label: 'Cyber Neon'
  },
  egypt: {
    list: ['🏺', '👁️', '🪲', '🪷', '🐍', '🦅', '👸', '👑', '☀️', '🪙'],
    colors: {
      '🏺': '#b5838d', '👁️': '#00b4d8', '🪲': '#2ec4b6', '🪷': '#ff9f1c',
      '🐍': '#2b9348', '🦅': '#e63946', '👸': '#ffb703', '👑': '#fb8500',
      '☀️': '#ffd166', '🪙': '#e9c46a'
    },
    label: 'Ancient Egypt'
  },
  crypto: {
    list: ['🐕', '🔹', '🔷', '🪙', '🔑', '🚀', '🌕', '📈', '💎', '🛸'],
    colors: {
      '🐕': '#ffb703', '🔹': '#3a86c0', '🔷': '#00d2ff', '🪙': '#ffd700',
      '🔑': '#f15bb5', '🚀': '#e63946', '🌕': '#ffffff', '📈': '#2a9d8f',
      '💎': '#00f5d4', '🛸': '#9b5de5'
    },
    label: 'Crypto Gold'
  }
};

// 9 paylines definitions
export const PAYLINES = [
  [1, 1, 1, 1, 1], // 1: Middle horizontal
  [0, 0, 0, 0, 0], // 2: Top horizontal
  [2, 2, 2, 2, 2], // 3: Bottom horizontal
  [0, 1, 2, 1, 0], // 4: V-shape (down-up)
  [2, 1, 0, 1, 2], // 5: Inverted V-shape (up-down)
  [0, 0, 1, 2, 2], // 6: Diagonal top-left to bottom-right
  [2, 2, 1, 0, 0], // 7: Diagonal bottom-left to top-right
  [1, 2, 1, 0, 1], // 8: Zigzag down-up-down
  [1, 0, 1, 2, 1]  // 9: Zigzag up-down-up
];

const ReelsCanvas = ({
  spinning,
  targetSymbols,
  theme = 'vegas',
  winningLines = [],
  speedMode = 'normal',
  onReelStop,
  onSpinComplete
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Store physical reel positions in a ref to avoid causing React re-renders on every frame.
  const reelsStateRef = useRef([]);

  // Use mutable refs for callbacks to avoid stale closures in the animation loop
  const onSpinCompleteRef = useRef(onSpinComplete);
  const onReelStopRef = useRef(onReelStop);

  useEffect(() => {
    onSpinCompleteRef.current = onSpinComplete;
  }, [onSpinComplete]);

  useEffect(() => {
    onReelStopRef.current = onReelStop;
  }, [onReelStop]);

  const colCount = 5;
  const rowCount = 3;
  const colWidth = 140;
  const rowHeight = 110;
  const canvasWidth = colCount * colWidth;
  const canvasHeight = rowCount * rowHeight;

  // Initialize or re-theme reels
  useEffect(() => {
    const list = THEME_SYMBOLS[theme].list;
    const initialReels = [];
    for (let c = 0; c < colCount; c++) {
      const initialSyms = [];
      for (let r = 0; r < rowCount + 2; r++) { // 3 visible + 2 buffer
        initialSyms.push(list[Math.floor(Math.random() * list.length)]);
      }
      initialReels.push({
        symbols: initialSyms,
        offsetY: 0,
        speed: 0,
        state: 'idle',
        bounceOffset: 0,
        bounceDirection: 1,
        injectCount: 0,
        stopped: true
      });
    }
    reelsStateRef.current = initialReels;
  }, [theme]);

  // Handle spin events
  useEffect(() => {
    if (!spinning || reelsStateRef.current.length === 0) return;

    const startDelay = speedMode === 'turbo' ? 0 : 150;
    const spinSpeed = speedMode === 'turbo' ? 42 : 28;

    reelsStateRef.current = reelsStateRef.current.map((reel, cIdx) => {
      return {
        ...reel,
        state: 'spinning',
        speed: spinSpeed,
        offsetY: 0,
        injectCount: 0,
        startTime: Date.now() + cIdx * startDelay,
        stopTime: Date.now() + (speedMode === 'turbo' ? 600 + cIdx * 150 : 1200 + cIdx * 350),
        stopped: false
      };
    });
  }, [spinning, speedMode]);

  // High performance Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let active = true;

    const paylineColors = [
      '#e63946', '#f77f00', '#fcbf49', '#eae2b7', '#06d6a0',
      '#277da1', '#7209b7', '#f72585', '#3f37c9'
    ];

    const render = () => {
      if (!active) return;

      // 1. Draw Background
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--reel-bg').trim() || '#111';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 2;
      for (let c = 1; c < colCount; c++) {
        ctx.beginPath();
        ctx.moveTo(c * colWidth, 0);
        ctx.lineTo(c * colWidth, canvasHeight);
        ctx.stroke();
      }

      const list = THEME_SYMBOLS[theme].list;
      const themeColors = THEME_SYMBOLS[theme].colors;
      const now = Date.now();
      let allStopped = true;

      // Update and draw reels
      const reels = reelsStateRef.current;

      reels.forEach((reel, cIdx) => {
        // Physics logic updates
        if (reel.state === 'spinning') {
          allStopped = false;
          if (now >= reel.startTime) {
            reel.offsetY += reel.speed;

            if (reel.offsetY >= rowHeight) {
              reel.offsetY -= rowHeight;
              const nextSyms = [...reel.symbols];
              nextSyms.pop(); // Pop bottom offscreen
              
              if (now >= reel.stopTime && targetSymbols && targetSymbols[cIdx]) {
                if (reel.injectCount < 3) {
                  const injectSym = targetSymbols[cIdx][2 - reel.injectCount];
                  nextSyms.unshift(injectSym);
                  reel.injectCount++;
                } else {
                  reel.state = 'stopping';
                  reel.speed = speedMode === 'turbo' ? 15 : 10;
                  nextSyms.unshift(list[Math.floor(Math.random() * list.length)]);
                }
              } else {
                nextSyms.unshift(list[Math.floor(Math.random() * list.length)]);
              }
              reel.symbols = nextSyms;
            }
          }
        } else if (reel.state === 'stopping') {
          allStopped = false;
          reel.offsetY += reel.speed;
          
          if (reel.offsetY >= rowHeight / 2) {
            reel.state = 'bounce';
            reel.offsetY = 0;
            reel.bounceOffset = 15;
            reel.bounceDirection = -1;
            
            if (!reel.stopped) {
              reel.stopped = true;
              audioEngine.playReelStop();
              if (onReelStopRef.current) onReelStopRef.current(cIdx);
            }
          }
        } else if (reel.state === 'bounce') {
          allStopped = false;
          reel.bounceOffset += reel.bounceDirection * 2;
          if (reel.bounceDirection === -1 && reel.bounceOffset <= -10) {
            reel.bounceDirection = 1;
          } else if (reel.bounceDirection === 1 && reel.bounceOffset >= 0) {
            reel.bounceOffset = 0;
            reel.state = 'idle';
          }
        }

        // 2. Render column symbols to canvas
        ctx.save();
        ctx.beginPath();
        ctx.rect(cIdx * colWidth, 0, colWidth, canvasHeight);
        ctx.clip();

        const drawOffset = reel.offsetY + (reel.state === 'bounce' ? reel.bounceOffset : 0);

        reel.symbols.forEach((symbol, sIdx) => {
          const x = cIdx * colWidth + colWidth / 2;
          const y = (sIdx - 1) * rowHeight + rowHeight / 2 + drawOffset;

          ctx.font = '54px "Segoe UI Emoji", "Apple Color Emoji", "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const symColor = themeColors[symbol] || '#fff';
          ctx.fillStyle = symColor;

          if (reel.state === 'spinning' && now >= reel.startTime) {
            // Draw motion blur
            ctx.shadowColor = symColor;
            ctx.shadowBlur = 8;
            ctx.globalAlpha = 0.25;
            ctx.fillText(symbol, x, y - 15);
            ctx.fillText(symbol, x, y + 15);
            ctx.globalAlpha = 0.5;
            ctx.fillText(symbol, x, y);
          } else {
            ctx.shadowColor = symColor;
            ctx.shadowBlur = theme === 'cyber' ? 12 : 5;
            ctx.globalAlpha = 1.0;
            ctx.fillText(symbol, x, y);
          }
          ctx.shadowBlur = 0;
        });
        
        ctx.restore();
      });

      // Trigger spin completed once
      if (spinning && allStopped) {
        if (onSpinCompleteRef.current) {
          onSpinCompleteRef.current();
        }
      }

      // Draw winning paylines overlay
      if (!spinning && winningLines.length > 0) {
        ctx.lineWidth = 5;
        ctx.shadowBlur = 10;

        winningLines.forEach((lineIdx) => {
          const color = paylineColors[lineIdx % paylineColors.length];
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.beginPath();

          PAYLINES[lineIdx].forEach((rowIdx, colIdx) => {
            const x = colIdx * colWidth + colWidth / 2;
            const y = rowIdx * rowHeight + rowHeight / 2;
            if (colIdx === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      active = false;
      cancelAnimationFrame(animationRef.current);
    };
  }, [spinning, targetSymbols, theme, winningLines, speedMode]);

  return (
    <div className="relative w-full flex justify-center items-center">
      {/* Outer Cabinet frame */}
      <div 
        className="w-full max-w-[700px] p-4 glass-panel glow-glow rounded-3xl"
        style={{
          borderWidth: '3px',
          borderColor: 'var(--border-glow)'
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="w-full rounded-2xl block"
          style={{
            aspectRatio: '700/330',
            backgroundColor: 'black'
          }}
        />
      </div>
    </div>
  );
};

export default ReelsCanvas;
