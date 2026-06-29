import React from 'react';
import { HelpCircle, Star, Award, Compass, Zap } from 'lucide-react';
import { THEME_SYMBOLS, PAYLINES } from './ReelsCanvas';

const PaytableModal = ({ theme = 'vegas' }) => {
  const currentThemeInfo = THEME_SYMBOLS[theme];
  const list = currentThemeInfo.list;
  const colors = currentThemeInfo.colors;

  // Let's define custom payout multiplier rules based on symbols index.
  // Lower index = lower payout. Higher index = higher payout.
  // Standard payouts:
  // Wild (Index 8) and Scatter (Index 9) have special payouts or rules.
  // Let's define the multipliers for matching 3, 4, and 5 symbols on a payline.
  const getPayoutInfo = (symbol, idx) => {
    if (idx === 9) { // Scatter
      return {
        name: 'Scatter',
        rule: '3+ Scatters anywhere triggers Free Spins (8 to 30 spins with 3x Multiplier!)',
        payouts: ['-', '-', '10x Wager']
      };
    }
    if (idx === 8) { // Wild
      return {
        name: 'Wild',
        rule: 'Substitutes for any symbol except Scatter to form winning lines',
        payouts: ['3x', '8x', '20x']
      };
    }
    
    // Standard symbols base multiplier
    const base = Number((1.2 + idx * 0.6).toFixed(1));
    return {
      name: `Symbol #${idx + 1}`,
      rule: 'Align 3, 4, or 5 on any active payline',
      payouts: [
        `${base}x`,
        `${(base * 2.5).toFixed(1)}x`,
        `${(base * 6).toFixed(0)}x`
      ]
    };
  };

  return (
    <div className="glass-panel flex flex-col gap-6">
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <h3 className="text-sm uppercase tracking-wider font-extrabold flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-accent" style={{ color: 'var(--accent-color)' }} /> Payout Rules & Paylines
        </h3>
      </div>

      {/* Special Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wild Rules */}
        <div className="p-3 bg-black/25 rounded-lg border border-white/5 flex gap-3">
          <div className="text-3xl bg-accent/15 w-12 h-12 rounded-lg flex items-center justify-center border border-accent/25 text-accent" style={{ borderColor: 'rgba(var(--accent-rgb), 0.25)', color: 'var(--accent-color)' }}>
            {list[8]}
          </div>
          <div>
            <div className="text-xs uppercase font-extrabold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-accent" style={{ fill: 'var(--accent-color)', color: 'var(--accent-color)' }} /> Wild Symbol
            </div>
            <p className="text-[11px] font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>
              Substitutes for all other symbols (except Scatter) to help complete winning payline combinations.
            </p>
          </div>
        </div>

        {/* Scatter Rules */}
        <div className="p-3 bg-black/25 rounded-lg border border-white/5 flex gap-3">
          <div className="text-3xl bg-purple-950/20 w-12 h-12 rounded-lg flex items-center justify-center border border-purple-500/25 text-purple-400">
            {list[9]}
          </div>
          <div>
            <div className="text-xs uppercase font-extrabold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-purple-400 text-purple-400" /> Scatter & Free Spins
            </div>
            <p className="text-[11px] font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>
              Landing 3 or more Scatters anywhere on the reels awards <b>Free Spins</b>:<br />
              • 3 Scatters = <b>8 Free Spins</b><br />
              • 4 Scatters = <b>15 Free Spins</b><br />
              • 5 Scatters = <b>30 Free Spins</b><br />
              All wins during Free Spins receive a <b>3x Multiplier</b>!
            </p>
          </div>
        </div>
      </div>

      {/* Payouts list */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>
          Symbol Payout Ratios ({currentThemeInfo.label} Theme)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {list.map((symbol, idx) => {
            const pInfo = getPayoutInfo(symbol, idx);
            const symColor = colors[symbol] || '#fff';
            return (
              <div key={symbol} className="bg-black/20 p-2.5 rounded-lg border border-white/5 flex flex-col items-center text-center">
                <div 
                  className="text-3.5xl font-display mb-1.5 filter drop-shadow-[0_2px_8px_rgba(var(--accent-rgb),0.3)]"
                  style={{ color: symColor }}
                >
                  {symbol}
                </div>
                <div className="text-[10px] font-bold text-white/50 uppercase tracking-wide">
                  {idx === 8 ? 'WILD' : idx === 9 ? 'SCATTER' : `Symbol #${idx + 1}`}
                </div>
                <div className="mt-2 flex flex-col gap-0.5 font-mono text-[10px] text-white/80 font-semibold w-full border-t border-white/5 pt-1.5">
                  <div className="flex justify-between"><span>5x</span><span className="text-accent font-extrabold" style={{ color: 'var(--accent-color)' }}>{pInfo.payouts[2]}</span></div>
                  <div className="flex justify-between"><span>4x</span><span>{pInfo.payouts[1]}</span></div>
                  <div className="flex justify-between"><span>3x</span><span>{pInfo.payouts[0]}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payline Grids */}
      <div className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-wider font-bold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <Compass className="w-3.5 h-3.5" /> 9 Active Paylines Schematic
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
          {PAYLINES.map((path, pIdx) => (
            <div key={pIdx} className="bg-black/25 p-2 rounded-lg border border-white/5 flex flex-col items-center">
              <div className="text-[10px] font-extrabold text-white/70 mb-1.5">Line {pIdx + 1}</div>
              
              {/* Miniature Grid */}
              <div className="grid grid-cols-5 gap-[2px] bg-black/45 p-[2px] rounded border border-white/10 w-full max-w-[65px]">
                {[0, 1, 2].map((rIdx) => (
                  <React.Fragment key={rIdx}>
                    {[0, 1, 2, 3, 4].map((cIdx) => {
                      const isHighlighted = path[cIdx] === rIdx;
                      return (
                        <div
                          key={cIdx}
                          className="aspect-square rounded-[1px]"
                          style={{
                            width: '10px',
                            backgroundColor: isHighlighted ? 'var(--accent-color)' : 'rgba(255,255,255,0.06)'
                          }}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaytableModal;
