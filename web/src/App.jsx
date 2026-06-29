import React, { useState, useEffect, useRef } from 'react';
import ReelsCanvas, { THEME_SYMBOLS, PAYLINES } from './components/ReelsCanvas';
import ControlPanel from './components/ControlPanel';
import HistoryTable from './components/HistoryTable';
import StatsDashboard from './components/StatsDashboard';
import ProfileManager from './components/ProfileManager';
import PaytableModal from './components/PaytableModal';
import audioEngine from './utils/AudioEngine';
import { Volume2, VolumeX, Sparkles, User, Info, Trophy, PlayCircle } from 'lucide-react';

const BASE_JACKPOT = 10000;

const App = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('play'); // play, profiles, analytics, paytable

  // Profiles State
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('slots_profiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'default-user',
        name: 'Player 1',
        avatar: '🤠',
        balance: 1000.0,
        initialBalance: 1000.0,
        spinsCount: 0,
        history: []
      }
    ];
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    const saved = localStorage.getItem('slots_active_profile_id');
    return saved || 'default-user';
  });

  // Theme, Audio, & Speed
  const [theme, setTheme] = useState('vegas'); // vegas, cyber, egypt, crypto
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [speedMode, setSpeedMode] = useState('normal'); // normal, turbo

  // Slot parameters
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const [bet, setBet] = useState(1.0); // Bet per line
  const [paylinesCount, setPaylinesCount] = useState(9); // 1, 3, 5, 9 lines
  const [spinning, setSpinning] = useState(false);
  const [targetSymbols, setTargetSymbols] = useState(null);
  
  // Last spin outcome states
  const [winningLines, setWinningLines] = useState([]);
  const [winAmount, setWinAmount] = useState(0);
  const [winType, setWinType] = useState('loss'); // loss, medium, big, jackpot, free_spins
  const [message, setMessage] = useState('');
  
  // Progressive Jackpot & Free Spins State
  const [progressiveJackpot, setProgressiveJackpot] = useState(() => {
    const saved = localStorage.getItem('slots_progressive_jackpot');
    return saved ? Number(saved) : BASE_JACKPOT;
  });
  
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
  const [freeSpinsTotalWon, setFreeSpinsTotalWon] = useState(0);
  const [freeSpinsTotalSession, setFreeSpinsTotalSession] = useState(0);

  // Auto Spin parameters
  const [autoSpinActive, setAutoSpinActiveState] = useState(false);
  const [autoSpinCount, setAutoSpinCountState] = useState(0);
  const autoSpinActiveRef = useRef(false);
  const autoSpinCountRef = useRef(0);

  const setAutoSpinActive = (val) => {
    autoSpinActiveRef.current = val;
    setAutoSpinActiveState(val);
  };

  const setAutoSpinCount = (val) => {
    if (typeof val === 'function') {
      setAutoSpinCountState(prev => {
        const next = val(prev);
        autoSpinCountRef.current = next;
        return next;
      });
    } else {
      autoSpinCountRef.current = val;
      setAutoSpinCountState(val);
    }
  };

  // Coin Rain Visual Effect
  const [showCoins, setShowCoins] = useState(false);
  const [coinParticles, setCoinParticles] = useState([]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('slots_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('slots_active_profile_id', activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    localStorage.setItem('slots_progressive_jackpot', progressiveJackpot.toString());
  }, [progressiveJackpot]);

  // Sync settings to AudioEngine
  useEffect(() => {
    audioEngine.setMuted(muted);
    audioEngine.setVolume(volume);
  }, [muted, volume]);

  // Handle active theme changes on HTML tag for styling variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Coin rain trigger helper
  const triggerCoinRain = (intensity) => {
    setShowCoins(true);
    const count = intensity === 'jackpot' ? 80 : intensity === 'big' ? 45 : 20;
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        id: i,
        left: Math.random() * 96 + '%',
        delay: Math.random() * 1.5 + 's',
        duration: Math.random() * 1 + 1.2 + 's'
      });
    }
    setCoinParticles(particles);
    setTimeout(() => {
      setShowCoins(false);
      setCoinParticles([]);
    }, 3200);
  };

  // --- Profile Handlers ---
  const handleSwitchProfile = (id) => {
    setActiveProfileId(id);
    setWinningLines([]);
    setWinAmount(0);
    setWinType('loss');
    setMessage('');
    setAutoSpinActive(false);
    setFreeSpinsRemaining(0);
    setFreeSpinsTotalWon(0);
  };

  const handleCreateProfile = (name, avatar) => {
    const newProfile = {
      id: 'profile-' + Date.now(),
      name,
      avatar,
      balance: 1000.0,
      initialBalance: 1000.0,
      spinsCount: 0,
      history: []
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const handleDeleteProfile = (id) => {
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    if (activeProfileId === id) {
      setActiveProfileId(updated[0].id);
    }
  };

  const handleResetBalance = (id) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          balance: 1000.0,
          initialBalance: 1000.0,
          spinsCount: 0,
          history: []
        };
      }
      return p;
    }));
    if (id === activeProfileId) {
      setFreeSpinsRemaining(0);
      setFreeSpinsTotalWon(0);
      setWinningLines([]);
      setWinAmount(0);
      setWinType('loss');
      setMessage('');
    }
  };

  const handleClearHistory = () => {
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          history: []
        };
      }
      return p;
    }));
  };

  // --- Core Spin Handler ---
  const handleSpin = () => {
    if (spinning) return;

    const totalWager = freeSpinsRemaining > 0 ? 0 : Number((bet * paylinesCount).toFixed(2));
    if (activeProfile.balance < totalWager && freeSpinsRemaining === 0) {
      alert("Insufficient balance!");
      setAutoSpinActive(false);
      return;
    }

    // Set Spinning state
    setSpinning(true);
    setWinningLines([]);
    setWinAmount(0);
    setWinType('loss');
    setMessage('');

    // Deduct bet if not a free spin
    if (freeSpinsRemaining === 0) {
      updateActiveProfileBalance(-totalWager);
      // Increment progressive jackpot (0.5% of wager)
      setProgressiveJackpot(prev => prev + totalWager * 0.005);
    }

    // Decrement auto spin count if active
    if (autoSpinActiveRef.current) {
      setAutoSpinCount(prev => prev - 1);
    }

    // Play spinning audio
    const spinDuration = speedMode === 'turbo' ? 1.3 : 2.5;
    audioEngine.playSpinSweep(spinDuration);

    // Generate final grid results (5 columns, 3 rows)
    const list = THEME_SYMBOLS[theme].list;
    const finalGrid = [];
    for (let c = 0; c < 5; c++) {
      const col = [];
      for (let r = 0; r < 3; r++) {
        col.push(list[Math.floor(Math.random() * list.length)]);
      }
      finalGrid.push(col);
    }

    setTargetSymbols(finalGrid);
  };

  // Callback when reels fully stop
  const handleSpinComplete = () => {
    setSpinning(false);
    calculateResults(targetSymbols);
  };

  // Balance modifier helper
  const updateActiveProfileBalance = (amount) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          balance: Number((p.balance + amount).toFixed(2))
        };
      }
      return p;
    }));
  };

  // Increment spin count helper
  const incrementActiveProfileSpins = () => {
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          spinsCount: p.spinsCount + 1
        };
      }
      return p;
    }));
  };

  // Log to history helper
  const logSpinToHistory = (log) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          history: [log, ...p.history]
        };
      }
      return p;
    }));
  };

  // --- Win Evaluation Logic ---
  const calculateResults = (grid) => {
    const list = THEME_SYMBOLS[theme].list;
    const wildSym = list[8];
    const scatterSym = list[9];
    const jackpotSym = list[7];

    let totalWin = 0;
    const activeWins = [];
    let jackpotWon = false;

    // 1. Evaluate Paylines
    for (let lineIdx = 0; lineIdx < paylinesCount; lineIdx++) {
      const path = PAYLINES[lineIdx];
      // Gather symbols on this payline
      const lineSyms = path.map((rowIdx, colIdx) => grid[colIdx][rowIdx]);

      // Check consecutive matches from left to right
      let firstSym = lineSyms[0];
      if (firstSym === scatterSym) continue; // Scatter cannot form line wins

      let targetSym = firstSym;
      let matchCount = 1;

      // If first symbol is Wild, find first non-wild to determine matching symbol
      if (firstSym === wildSym) {
        let foundNonWild = false;
        for (let i = 1; i < 5; i++) {
          if (lineSyms[i] !== wildSym && lineSyms[i] !== scatterSym) {
            targetSym = lineSyms[i];
            foundNonWild = true;
            break;
          } else if (lineSyms[i] === scatterSym) {
            break;
          }
        }
        if (!foundNonWild) {
          targetSym = wildSym;
        }
      }

      // Count consecutive
      for (let i = 1; i < 5; i++) {
        const current = lineSyms[i];
        if (current === targetSym || current === wildSym) {
          matchCount++;
        } else {
          break;
        }
      }

      // We need at least 3 matching symbols
      if (matchCount >= 3) {
        const symbolIdx = list.indexOf(targetSym);
        
        // Handle Progressive Jackpot (5 of the Jackpot Symbols on an active line)
        if (targetSym === jackpotSym && matchCount === 5) {
          jackpotWon = true;
          activeWins.push({ lineIdx, matchCount, symbol: targetSym, amount: progressiveJackpot, isJackpot: true });
        } else {
          // Standard line pay multiplier formula:
          // 3x Match: base
          // 4x Match: base * 2.5
          // 5x Match: base * 6
          const baseMultiplier = 1.2 + symbolIdx * 0.6;
          let multiplier = baseMultiplier;
          if (matchCount === 4) multiplier *= 2.5;
          if (matchCount === 5) multiplier *= 6;

          const lineWin = Number((bet * multiplier).toFixed(2));
          activeWins.push({ lineIdx, matchCount, symbol: targetSym, amount: lineWin, isJackpot: false });
        }
      }
    }

    // Sum line wins
    let spinLineWin = activeWins.reduce((sum, win) => sum + win.amount, 0);

    // Apply Free Spins multiplier (3x)
    if (freeSpinsRemaining > 0) {
      spinLineWin = Number((spinLineWin * 3).toFixed(2));
    }
    totalWin += spinLineWin;

    // 2. Evaluate Scatters (anywhere on the board)
    let scatterCount = 0;
    const scatterCoords = [];
    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 3; r++) {
        if (grid[c][r] === scatterSym) {
          scatterCount++;
          scatterCoords.push({ c, r });
        }
      }
    }

    let freeSpinsTriggered = 0;
    let scatterPayout = 0;

    if (scatterCount >= 3) {
      if (scatterCount === 3) freeSpinsTriggered = 8;
      else if (scatterCount === 4) freeSpinsTriggered = 15;
      else if (scatterCount === 5) freeSpinsTriggered = 30;

      // Scatter cash award (10x total wager)
      const totalWager = Number((bet * paylinesCount).toFixed(2));
      scatterPayout = Number((totalWager * 10).toFixed(2));
      totalWin += scatterPayout;
    }

    // 3. Process outcomes
    let finalWinType = 'loss';
    let outcomeMsg = '';

    if (jackpotWon) {
      finalWinType = 'jackpot';
      outcomeMsg = `🎉 MEGA PROGRESSIVE JACKPOT! WON $${progressiveJackpot.toLocaleString(undefined, { minimumFractionDigits: 2 })}! 🎉`;
      setProgressiveJackpot(BASE_JACKPOT);
      triggerCoinRain('jackpot');
      audioEngine.playWinTone('jackpot');
    } else if (freeSpinsTriggered > 0) {
      finalWinType = 'free_spins';
      outcomeMsg = `✨ SCATTER BONUS! ${freeSpinsTriggered} Free Spins Activated (+ $${scatterPayout.toFixed(2)})! ✨`;
      
      setFreeSpinsRemaining(prev => prev + freeSpinsTriggered);
      setFreeSpinsTotalSession(prev => prev + freeSpinsTriggered);
      triggerCoinRain('big');
      audioEngine.playWinTone('big');
    } else if (totalWin > 0) {
      const totalWager = Number((bet * paylinesCount).toFixed(2));
      const ratio = totalWin / (totalWager || 1);
      
      if (ratio >= 15) {
        finalWinType = 'big';
        outcomeMsg = `🔥 BIG WIN! You won $${totalWin.toFixed(2)}! 🔥`;
        triggerCoinRain('big');
        audioEngine.playWinTone('big');
      } else {
        finalWinType = 'medium';
        outcomeMsg = `You Won: $${totalWin.toFixed(2)}!`;
        triggerCoinRain('medium');
        audioEngine.playWinTone('medium');
      }
    } else {
      outcomeMsg = "Better luck next spin!";
    }

    // Apply payouts to profile balance
    if (totalWin > 0) {
      updateActiveProfileBalance(totalWin);
      if (freeSpinsRemaining > 0) {
        setFreeSpinsTotalWon(prev => prev + totalWin);
      }
    }

    // Decrement free spin counter if active
    if (freeSpinsRemaining > 0) {
      setFreeSpinsRemaining(prev => {
        const nextSpins = prev - 1;
        if (nextSpins === 0) {
          // Free spins round ends, display summary
          setTimeout(() => {
            alert(`🎉 Free Spins Complete!\nTotal Won: $${freeSpinsTotalWon.toFixed(2)} across ${freeSpinsTotalSession} spins!`);
            setFreeSpinsTotalWon(0);
            setFreeSpinsTotalSession(0);
          }, 800);
        }
        return nextSpins;
      });
    }

    // Set UI outcomes
    setWinAmount(totalWin);
    setWinType(finalWinType);
    setWinningLines(activeWins.map(w => w.lineIdx));
    setMessage(outcomeMsg);
    incrementActiveProfileSpins();

    // Prepare text summary of middle row for history
    const middleRowText = [grid[0][1], grid[1][1], grid[2][1], grid[3][1], grid[4][1]].join(' ');

    // Log this spin to active user profile history
    const logEntry = {
      id: 'log-' + Date.now(),
      timestamp: Date.now(),
      spinNumber: activeProfile.spinsCount + 1,
      betTotal: Number((bet * paylinesCount).toFixed(2)),
      winAmount: totalWin,
      winType: finalWinType,
      symbolsSummary: middleRowText,
      theme
    };
    logSpinToHistory(logEntry);

    // Handle Auto Spin loops
    if (autoSpinActiveRef.current) {
      if (autoSpinCountRef.current > 0 && activeProfile.balance >= Number((bet * paylinesCount).toFixed(2))) {
        // Stagger next auto spin depending on speed mode
        setTimeout(() => {
          handleSpin();
        }, speedMode === 'turbo' ? 400 : 900);
      } else {
        setAutoSpinActive(false);
        setAutoSpinCount(0);
      }
    }
  };

  const handleStartAutoSpin = (count) => {
    setAutoSpinActive(true);
    setAutoSpinCount(count);
    // Start immediately
    handleSpin();
  };

  const handleStopAutoSpin = () => {
    setAutoSpinActive(false);
    setAutoSpinCount(0);
  };

  // Keyboard accessibility check
  const totalWager = Number((bet * paylinesCount).toFixed(2));

  return (
    <div className="app-container relative">
      {/* Coin Rain Element */}
      {showCoins && (
        <div className="coin-rain">
          {coinParticles.map(p => (
            <div
              key={p.id}
              className="coin-particle"
              style={{
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration
              }}
            />
          ))}
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="glass-panel nav-header flex justify-between items-center z-10">
        <div className="nav-logo-group">
          <span className="logo-icon">🎰</span>
          <div>
            <h1 className="logo-text">YOUR SLOTS</h1>
            <p className="text-[9px] tracking-wider uppercase font-bold text-white/40">Next Level Slot Machine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button
            onClick={() => { audioEngine.playClick(); setActiveTab('play'); }}
            className={`nav-tab-btn ${activeTab === 'play' ? 'active' : ''}`}
          >
            <PlayCircle className="w-4 h-4" /> Play Slots
          </button>
          <button
            onClick={() => { audioEngine.playClick(); setActiveTab('profiles'); }}
            className={`nav-tab-btn ${activeTab === 'profiles' ? 'active' : ''}`}
          >
            <User className="w-4 h-4" /> Users
          </button>
          <button
            onClick={() => { audioEngine.playClick(); setActiveTab('analytics'); }}
            className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <Trophy className="w-4 h-4" /> Stats
          </button>
          <button
            onClick={() => { audioEngine.playClick(); setActiveTab('paytable'); }}
            className={`nav-tab-btn ${activeTab === 'paytable' ? 'active' : ''}`}
          >
            <Info className="w-4 h-4" /> Paytable
          </button>
        </div>

        {/* Global Controls & Theme */}
        <div className="settings-bar">
          {/* Theme selector */}
          <div className="theme-selector">
            <span className="text-[10px] uppercase font-bold tracking-wider mr-1 text-white/50 self-center">Theme</span>
            <button
              onClick={() => { audioEngine.playClick(); setTheme('vegas'); }}
              title="Vegas Classic"
              className={`theme-dot ${theme === 'vegas' ? 'active' : ''}`}
              style={{ backgroundColor: '#0f4c27' }}
            />
            <button
              onClick={() => { audioEngine.playClick(); setTheme('cyber'); }}
              title="Cyber Neon"
              className={`theme-dot ${theme === 'cyber' ? 'active' : ''}`}
              style={{ backgroundColor: '#5c0099' }}
            />
            <button
              onClick={() => { audioEngine.playClick(); setTheme('egypt'); }}
              title="Ancient Egypt"
              className={`theme-dot ${theme === 'egypt' ? 'active' : ''}`}
              style={{ backgroundColor: '#d4af37' }}
            />
            <button
              onClick={() => { audioEngine.playClick(); setTheme('crypto'); }}
              title="Crypto Gold"
              className={`theme-dot ${theme === 'crypto' ? 'active' : ''}`}
              style={{ backgroundColor: '#1b262c' }}
            />
          </div>

          {/* Sound switch */}
          <button
            onClick={() => setMuted(!muted)}
            className="p-2 rounded bg-black/20 border border-white/5 text-white/70 hover:text-white"
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Speed switch */}
          <button
            onClick={() => {
              audioEngine.playClick();
              setSpeedMode(speedMode === 'normal' ? 'turbo' : 'normal');
            }}
            className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded bg-black/20 border border-white/5 text-white"
          >
            ⚡ {speedMode === 'turbo' ? 'TURBO' : 'NORMAL'}
          </button>
        </div>
      </header>

      {/* CORE DISPLAY PANELS */}
      <main className="w-full flex-grow">
        {activeTab === 'play' && (
          <div className="game-grid">
            {/* Column 1: History Log */}
            <div className="game-col-left flex flex-col gap-5">
              <HistoryTable
                history={activeProfile.history}
                onClearHistory={handleClearHistory}
              />
            </div>

            {/* Column 2: Reels, Jackpot & Status */}
            <div className="game-col-center flex flex-col gap-5">
              {/* Progressive Jackpot Indicator */}
              <div 
                className="glass-panel flex justify-between items-center px-6 py-4 rounded-2xl relative overflow-hidden"
                style={{
                  borderLeft: '5px solid var(--accent-color)',
                  background: 'linear-gradient(90deg, rgba(var(--accent-rgb),0.08) 0%, rgba(0,0,0,0.15) 100%)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl animate-bounce">🏆</div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Progressive Jackpot</div>
                    <div className="font-display text-2.5xl font-black text-accent tracking-tighter" style={{ color: 'var(--accent-color)' }}>
                      ${progressiveJackpot.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Active user status tag */}
                <div className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-xl border border-white/5">
                  <span className="text-2xl">{activeProfile.avatar}</span>
                  <div>
                    <div className="text-[10px] uppercase font-bold opacity-60">Active Player</div>
                    <div className="text-xs font-black">{activeProfile.name}</div>
                  </div>
                </div>
              </div>

              {/* HTML5 Reels Canvas */}
              <ReelsCanvas
                spinning={spinning}
                targetSymbols={targetSymbols}
                theme={theme}
                winningLines={winningLines}
                speedMode={speedMode}
                onSpinComplete={handleSpinComplete}
              />

              {/* Status Message Panel */}
              <div 
                className={`glass-panel min-h-[56px] flex items-center justify-center text-center px-4 py-3 rounded-xl border ${
                  winAmount > 0 
                    ? 'border-accent/40 bg-accent/5' 
                    : 'border-white/5 bg-black/10'
                }`}
                style={winAmount > 0 ? { borderColor: 'rgba(var(--accent-rgb), 0.4)' } : {}}
              >
                {freeSpinsRemaining > 0 && (
                  <div className="text-xs uppercase font-extrabold text-purple-400 mr-4 px-2 py-1 rounded bg-purple-950/30 border border-purple-800/40 animate-pulse">
                    🎁 FREE SPIN MODE: {freeSpinsRemaining} Left (3x Multiplier!)
                  </div>
                )}
                <div className={`font-display text-base font-bold ${
                  winType === 'jackpot' 
                    ? 'text-yellow-400 text-lg font-black' 
                    : winType === 'big' 
                    ? 'text-orange-500 font-extrabold' 
                    : winAmount > 0 
                    ? 'text-accent font-extrabold' 
                    : 'text-white/60'
                }`}
                style={winType === 'jackpot' ? { color: '#ffd700' } : (winAmount > 0 ? { color: 'var(--accent-color)' } : {})}
                >
                  {message || "Place your bet and hit SPIN to play!"}
                </div>
              </div>
            </div>

            {/* Column 3: Balance & Control Panel */}
            <div className="game-col-right flex flex-col gap-5">
              {/* Account Balance Widget */}
              <div 
                className="glass-panel flex flex-col justify-center p-5 rounded-2xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 100%)'
                }}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-60 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" style={{ color: 'var(--accent-color)' }} /> Account Balance
                </div>
                <div className="font-display text-3.5xl font-black text-emerald-400 tracking-tight mt-1">
                  ${activeProfile.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] font-semibold opacity-50 mt-1 flex justify-between">
                  <span>Initial: ${activeProfile.initialBalance.toFixed(2)}</span>
                  <span>Spins: {activeProfile.spinsCount}</span>
                </div>
              </div>

              {/* Game Adjustments Control Panel */}
              <ControlPanel
                spinning={spinning}
                bet={bet}
                setBet={setBet}
                paylinesCount={paylinesCount}
                setPaylinesCount={setPaylinesCount}
                onSpin={handleSpin}
                autoSpinActive={autoSpinActive}
                autoSpinCount={autoSpinCount}
                onStartAutoSpin={handleStartAutoSpin}
                onStopAutoSpin={handleStopAutoSpin}
                maxBetLimit={100}
                balance={activeProfile.balance}
              />
            </div>
          </div>
        )}

        {activeTab === 'profiles' && (
          <ProfileManager
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSwitchProfile={handleSwitchProfile}
            onCreateProfile={handleCreateProfile}
            onDeleteProfile={handleDeleteProfile}
            onResetBalance={handleResetBalance}
          />
        )}

        {activeTab === 'analytics' && (
          <StatsDashboard
            history={activeProfile.history}
            balance={activeProfile.balance}
            initialBalance={activeProfile.initialBalance}
          />
        )}

        {activeTab === 'paytable' && (
          <PaytableModal theme={theme} />
        )}
      </main>

      <footer className="text-center text-[10px] text-white/20 font-semibold py-4 border-t border-white/5 mt-4">
        Your Slots © 2026. Created by Atanas Youdanov.
      </footer>
    </div>
  );
};

export default App;
