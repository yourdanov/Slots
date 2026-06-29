import React from 'react';
import { History, Trash2, Coins } from 'lucide-react';
import audioEngine from '../utils/AudioEngine';

const HistoryTable = ({ history, onClearHistory }) => {
  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear your spin history?")) {
      audioEngine.playClick();
      onClearHistory();
    }
  };

  const getWinRowStyle = (winType) => {
    switch (winType) {
      case 'jackpot':
        return { borderLeft: '3px solid var(--accent-color)', background: 'rgba(255, 215, 0, 0.04)' };
      case 'big':
        return { borderLeft: '3px solid #f39c12', background: 'rgba(243, 156, 18, 0.02)' };
      case 'free_spins':
        return { borderLeft: '3px solid #9b5de5', background: 'rgba(155, 93, 229, 0.02)' };
      default:
        return {};
    }
  };

  return (
    <div className="glass-panel flex flex-col gap-4 h-full" style={{ maxHeight: '600px', minHeight: '400px' }}>
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <h3 className="text-sm uppercase tracking-wider font-extrabold flex items-center gap-2">
          <History className="w-4 h-4 text-accent" style={{ color: 'var(--accent-color)' }} /> Spin History
        </h3>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="p-1.5 rounded hover:bg-red-950/40 text-white/40 hover:text-red-400 border border-transparent hover:border-red-900/30 flex items-center gap-1 text-[10px] font-bold"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted select-none" style={{ color: 'var(--text-muted)' }}>
          <Coins className="w-8 h-8 mb-2 opacity-20" />
          <p className="text-xs font-semibold">No spins logged yet.</p>
          <p className="text-[10px] opacity-50 mt-0.5">Spin the reels to log activity.</p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto pr-1" style={{ maxHeight: '480px' }}>
          <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '60px' }} />
              <col style={{ width: '56px' }} />
              <col style={{ width: '74px' }} />
              <col style={{ width: '90px' }} />
            </colgroup>
            <thead>
              <tr className="text-[9px] uppercase font-bold tracking-wider border-b border-white/5" style={{ color: 'var(--text-muted)' }}>
                <th className="py-2 pl-1" style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-panel)', zIndex: 1 }}>Spin</th>
                <th className="py-2" style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-panel)', zIndex: 1 }}>Bet</th>
                <th className="py-2" style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-panel)', zIndex: 1 }}>Win</th>
                <th className="py-2 pr-1 text-right" style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-panel)', zIndex: 1 }}>Symbols</th>
              </tr>
            </thead>
            <tbody className="text-[9.5px] divide-y divide-white/5">
              {history.slice(0, 100).map((log, index) => {
                const isWin = log.winAmount > 0;
                
                return (
                  <tr 
                    key={log.id || index} 
                    className="hover:bg-white/[0.02] transition-colors"
                    style={{ ...getWinRowStyle(log.winType), whiteSpace: 'nowrap' }}
                  >
                    <td className="py-2 pl-1 text-white/40 font-mono" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      #{log.spinNumber || (history.length - index)}
                    </td>
                    <td className="py-2 text-white/70 font-mono font-medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      ${log.betTotal.toFixed(2)}
                    </td>
                    <td className="py-2" style={{ overflow: 'hidden' }}>
                      {log.winType === 'jackpot' ? (
                        <span className="px-1 py-0.5 rounded text-[7px] font-black uppercase bg-yellow-400 text-black leading-none">Jackpot</span>
                      ) : log.winType === 'big' ? (
                        <span className="px-1 py-0.5 rounded text-[7px] font-extrabold uppercase bg-orange-500 text-white leading-none">Big Win</span>
                      ) : log.winType === 'free_spins' ? (
                        <span className="px-1 py-0.5 rounded text-[7px] font-bold uppercase bg-purple-500 text-white leading-none">Bonus</span>
                      ) : isWin ? (
                        <span className="text-emerald-400 font-mono font-bold leading-none">+${log.winAmount.toFixed(2)}</span>
                      ) : (
                        <span className="text-white/20 font-mono leading-none">$0.00</span>
                      )}
                    </td>
                    <td 
                      className="py-2 pr-1 text-right font-display text-[10.5px]" 
                      style={{ 
                        letterSpacing: '0.5px', 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden'
                      }}
                    >
                      {log.symbolsSummary}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryTable;
