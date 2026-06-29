import React, { useEffect } from 'react';
import audioEngine from '../utils/AudioEngine';
import { Play, Square, CirclePlus, CircleMinus, Coins, Compass } from 'lucide-react';

const ControlPanel = ({
  spinning,
  bet,
  setBet,
  paylinesCount,
  setPaylinesCount,
  onSpin,
  autoSpinActive,
  autoSpinCount,
  onStartAutoSpin,
  onStopAutoSpin,
  maxBetLimit,
  balance
}) => {
  // Bind spacebar key for spinning
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        // Prevent default spacebar scrolling
        e.preventDefault();
        if (!spinning) {
          audioEngine.playClick();
          onSpin();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spinning, onSpin]);

  const adjustBet = (amount) => {
    audioEngine.playClick();
    const newBet = Math.max(0.1, Number((bet + amount).toFixed(2)));
    if (newBet <= maxBetLimit) {
      setBet(newBet);
    }
  };

  const setMaxBet = () => {
    audioEngine.playClick();
    const maxPossibleBet = Math.min(maxBetLimit, balance);
    if (maxPossibleBet > 0) {
      setBet(Number(maxPossibleBet.toFixed(2)));
    }
  };

  const handlePaylineChange = (count) => {
    audioEngine.playClick();
    setPaylinesCount(count);
  };

  const totalWager = Number((bet * paylinesCount).toFixed(2));

  return (
    <div className="glass-panel glow-glow flex flex-col gap-5 p-5">
      <div className="grid grid-cols-2 gap-4">
        {/* Bet Adjustments */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wider text-muted font-bold flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Coins className="w-3.5 h-3.5" /> Bet per Line
          </label>
          <div className="flex items-center gap-2">
            <button
              disabled={spinning || bet <= 0.1}
              onClick={() => adjustBet(-0.1)}
              className="p-2 rounded bg-black/35 hover:bg-black/50 text-white disabled:opacity-30 border border-white/5 flex items-center justify-center"
              style={{ width: '36px', height: '36px' }}
            >
              <CircleMinus className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center font-display text-xl font-extrabold tracking-tight px-1 py-1 bg-black/25 rounded border border-white/5" style={{ minWidth: '70px' }}>
              ${bet.toFixed(2)}
            </div>
            <button
              disabled={spinning || bet + 0.1 > maxBetLimit}
              onClick={() => adjustBet(0.1)}
              className="p-2 rounded bg-black/35 hover:bg-black/50 text-white disabled:opacity-30 border border-white/5 flex items-center justify-center"
              style={{ width: '36px', height: '36px' }}
            >
              <CirclePlus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              disabled={spinning}
              onClick={setMaxBet}
              className="flex-1 text-xs uppercase tracking-wider font-bold py-1.5 px-2 rounded bg-black/40 hover:bg-black/60 text-white border border-white/10 text-center"
            >
              Max Bet
            </button>
          </div>
        </div>

        {/* Paylines Count */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wider text-muted font-bold flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Compass className="w-3.5 h-3.5" /> Paylines
          </label>
          <div className="grid grid-cols-4 gap-1.5 bg-black/20 p-1 rounded border border-white/5">
            {[1, 3, 5, 9].map((count) => (
              <button
                key={count}
                disabled={spinning}
                onClick={() => handlePaylineChange(count)}
                className={`py-1.5 text-sm font-extrabold rounded ${
                  paylinesCount === count
                    ? 'bg-accent text-black font-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                style={paylinesCount === count ? { backgroundColor: 'var(--accent-color)', color: '#000' } : {}}
              >
                {count}
              </button>
            ))}
          </div>
          <div className="text-xs text-center font-semibold uppercase tracking-wider py-1.5" style={{ color: 'var(--text-muted)' }}>
            Total Wager: <span className="font-extrabold font-display text-sm text-white">${totalWager.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <hr className="border-white/5" />

      {/* Auto Spin Options */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>
          Auto Spin Controls
        </span>
        {autoSpinActive ? (
          <button
            onClick={() => {
              audioEngine.playClick();
              onStopAutoSpin();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-wide shadow-lg shadow-red-600/20"
          >
            <Square className="w-4 h-4 fill-white" /> Stop Auto ({autoSpinCount} left)
          </button>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {[10, 25, 50, 100].map((count) => (
              <button
                key={count}
                disabled={spinning || totalWager > balance}
                onClick={() => {
                  audioEngine.playClick();
                  onStartAutoSpin(count);
                }}
                className="flex-1 min-w-[60px] py-1.5 text-xs font-bold rounded bg-black/35 hover:bg-black/50 text-white/80 border border-white/5 disabled:opacity-20"
              >
                {count} spins
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Spin Button */}
      <div className="relative">
        <button
          disabled={spinning || totalWager > balance || autoSpinActive}
          onClick={() => {
            audioEngine.playClick();
            onSpin();
          }}
          className={`w-full py-4 px-6 btn-primary rounded-xl flex items-center justify-center gap-3 font-extrabold text-lg select-none ${
            spinning ? 'opacity-80' : 'btn-spin-glow'
          }`}
          style={
            (spinning || totalWager > balance || autoSpinActive)
              ? { background: '#2b3931', color: '#617366', boxShadow: 'none' }
              : {}
          }
        >
          {spinning ? (
            <span className="animate-pulse">Spinning...</span>
          ) : totalWager > balance ? (
            <span>Insufficient Funds</span>
          ) : (
            <>
              <Play className="w-5 h-5 fill-black" />
              <span>Spin!</span>
            </>
          )}
        </button>
        <div className="text-[10px] text-center font-semibold tracking-wide mt-2" style={{ color: 'var(--text-muted)' }}>
          Press <span className="px-1.5 py-0.5 rounded bg-black/30 border border-white/10 text-white font-extrabold font-display">SPACE</span> to Spin
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
