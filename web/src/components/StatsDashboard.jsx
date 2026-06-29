import React, { useRef, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, RefreshCcw, Info } from 'lucide-react';
import audioEngine from '../utils/AudioEngine';

const StatsDashboard = ({ history, balance, initialBalance = 1000 }) => {
  const lineCanvasRef = useRef(null);
  const pieCanvasRef = useRef(null);

  // Compute stats
  const totalSpins = history.length;
  const totalWagered = history.reduce((acc, log) => acc + log.betTotal, 0);
  const totalWon = history.reduce((acc, log) => acc + log.winAmount, 0);
  const netProfit = totalWon - totalWagered;
  
  // Return to Player percentage (theoretical starts at 96%, calculated actual based on history)
  const actualRTP = totalWagered > 0 ? (totalWon / totalWagered) * 100 : 0;

  // 1. Draw Balance Trend Line Chart
  useEffect(() => {
    const canvas = lineCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Prepare data (extract balance history from spins, oldest to newest)
    // Starting balance -> balance after spin 1 -> balance after spin 2 ...
    let balanceHistory = [initialBalance];
    let current = initialBalance;
    
    // Process in chronological order (reverse of history array which is newest first)
    const chronoHistory = [...history].reverse();
    chronoHistory.forEach(log => {
      current = current - log.betTotal + log.winAmount;
      balanceHistory.push(current);
    });

    // If too many points, downsample to fit
    if (balanceHistory.length > 50) {
      const step = Math.ceil(balanceHistory.length / 50);
      balanceHistory = balanceHistory.filter((_, idx) => idx % step === 0);
      // Ensure latest is included
      if (balanceHistory[balanceHistory.length - 1] !== current) {
        balanceHistory.push(current);
      }
    }

    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const minVal = Math.min(...balanceHistory) * 0.95;
    const maxVal = Math.max(...balanceHistory) * 1.05;
    const valRange = maxVal - minVal || 10;

    // Draw background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight * i) / 4;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Label values on y axis
      const labelVal = maxVal - (valRange * i) / 4;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`$${Math.round(labelVal)}`, 2, y + 3);
    }

    if (balanceHistory.length > 1) {
      // Begin drawing the path
      ctx.beginPath();
      balanceHistory.forEach((val, idx) => {
        const x = padding + (chartWidth * idx) / (balanceHistory.length - 1);
        const y = padding + chartHeight - (chartHeight * (val - minVal)) / valRange;

        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      // Save path for fill stroke
      ctx.strokeStyle = netProfit >= 0 ? '#2ec4b6' : '#ff4d4d';
      ctx.lineWidth = 3.5;
      
      // Shadow glow for the line
      ctx.shadowBlur = 8;
      ctx.shadowColor = netProfit >= 0 ? 'rgba(46, 196, 182, 0.4)' : 'rgba(255, 77, 77, 0.4)';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw gradient under the line
      const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
      gradient.addColorStop(0, netProfit >= 0 ? 'rgba(46, 196, 182, 0.25)' : 'rgba(255, 77, 77, 0.25)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.lineTo(padding + chartWidth, padding + chartHeight);
      ctx.lineTo(padding, padding + chartHeight);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("No balance logs yet. Spin to view history chart.", width / 2, height / 2);
    }
  }, [history, balance, initialBalance, netProfit]);

  // 2. Draw Win Types Distribution Pie Chart
  useEffect(() => {
    const canvas = pieCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Calculate outcomes distribution
    const outcomes = {
      loss: 0,
      medium: 0, // normal win
      big: 0,
      jackpot: 0
    };

    history.forEach(log => {
      if (log.winType === 'loss') outcomes.loss++;
      else if (log.winType === 'medium') outcomes.medium++;
      else if (log.winType === 'big') outcomes.big++;
      else if (log.winType === 'jackpot') outcomes.jackpot++;
    });

    const total = history.length || 1;
    const data = [
      { label: 'Loss', count: outcomes.loss, color: '#495057' },
      { label: 'Win', count: outcomes.medium, color: '#2ec4b6' },
      { label: 'Big Win', count: outcomes.big, color: '#f39c12' },
      { label: 'Jackpot', count: outcomes.jackpot, color: '#ffd700' }
    ];

    const centerX = width / 2.8;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 15;

    let startAngle = -Math.PI / 2;

    if (history.length > 0) {
      data.forEach(segment => {
        const sliceAngle = (segment.count / total) * 2 * Math.PI;
        
        if (sliceAngle > 0) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
          ctx.lineTo(centerX, centerY);
          ctx.closePath();
          
          ctx.fillStyle = segment.color;
          ctx.fill();
          
          ctx.strokeStyle = '#1e1e24';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          startAngle += sliceAngle;
        }
      });

      // Draw Legend on the right side
      const legendX = centerX + radius + 15;
      const legendYStart = centerY - (data.length * 15) / 2;
      
      data.forEach((segment, idx) => {
        const y = legendYStart + idx * 18;
        
        ctx.fillStyle = segment.color;
        ctx.fillRect(legendX, y, 12, 12);
        
        ctx.fillStyle = '#fff';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const percent = ((segment.count / total) * 100).toFixed(0);
        ctx.fillText(`${segment.label} (${percent}%)`, legendX + 18, y + 6);
      });
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("No spin logs yet.", width / 2, height / 2);
    }
  }, [history]);

  return (
    <div className="glass-panel flex flex-col gap-6">
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <h3 className="text-sm uppercase tracking-wider font-extrabold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent" style={{ color: 'var(--accent-color)' }} /> Player Analytics
        </h3>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-3 bg-black/25 rounded border border-white/5 text-center">
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Total Spins</div>
          <div className="font-display text-2xl font-black mt-1">{totalSpins}</div>
        </div>

        <div className="p-3 bg-black/25 rounded border border-white/5 text-center">
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Wagered</div>
          <div className="font-display text-2xl font-black mt-1 text-white/80">${totalWagered.toFixed(2)}</div>
        </div>

        <div className="p-3 bg-black/25 rounded border border-white/5 text-center">
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Payouts</div>
          <div className="font-display text-2xl font-black mt-1 text-white/80">${totalWon.toFixed(2)}</div>
        </div>

        <div className="p-3 bg-black/25 rounded border border-white/5 text-center">
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Net returns</div>
          <div className={`font-display text-2xl font-black mt-1 flex items-center justify-center gap-1 ${
            netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'
          }`}>
            {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
          </div>
        </div>

        <div className="p-3 bg-black/25 rounded border border-white/5 text-center col-span-2 md:col-span-1">
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Actual RTP</div>
          <div className="font-display text-2xl font-black mt-1 text-accent" style={{ color: 'var(--accent-color)' }}>
            {actualRTP.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Canvas Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {/* Balance Trend */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs uppercase tracking-wider font-bold text-muted flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            {netProfit >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-500" />}
            Balance History ($)
          </h4>
          <div className="bg-black/20 p-3 rounded-xl border border-white/5 flex items-center justify-center">
            <canvas
              ref={lineCanvasRef}
              width={500}
              height={220}
              className="w-full h-auto max-h-[220px]"
            />
          </div>
        </div>

        {/* Win distribution */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs uppercase tracking-wider font-bold text-muted flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Info className="w-3.5 h-3.5" /> Outcome Distribution
          </h4>
          <div className="bg-black/20 p-3 rounded-xl border border-white/5 flex items-center justify-center">
            <canvas
              ref={pieCanvasRef}
              width={500}
              height={220}
              className="w-full h-auto max-h-[220px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
