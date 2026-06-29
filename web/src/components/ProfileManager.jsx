import React, { useState } from 'react';
import { Users, UserPlus, UserCheck, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import audioEngine from '../utils/AudioEngine';

const AVATARS = ['🤠', '🥷', '👾', '🦄', '🧙', '🐯', '🚀', '💎', '🦖', '🐼', '🦊', '🦁'];

const ProfileManager = ({
  profiles,
  activeProfileId,
  onSwitchProfile,
  onCreateProfile,
  onDeleteProfile,
  onResetBalance
}) => {
  const [newUsername, setNewUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    const trimmedName = newUsername.trim();
    if (!trimmedName) {
      setErrorMsg("Username cannot be empty");
      return;
    }
    
    if (trimmedName.length > 15) {
      setErrorMsg("Username must be 15 characters or less");
      return;
    }

    // Check for duplicate username
    if (profiles.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      setErrorMsg("Username already exists");
      return;
    }

    audioEngine.playClick();
    onCreateProfile(trimmedName, selectedAvatar);
    setNewUsername('');
    setSelectedAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  };

  const handleReset = (id, name) => {
    if (window.confirm(`Are you sure you want to reset ${name}'s balance to $1,000.00? This will clear stats & history.`)) {
      audioEngine.playClick();
      onResetBalance(id);
    }
  };

  const handleDelete = (id, name, e) => {
    e.stopPropagation(); // Avoid switching to the profile before deleting it
    if (profiles.length <= 1) {
      alert("You must keep at least one profile!");
      return;
    }
    if (window.confirm(`Are you sure you want to delete profile "${name}"? This action cannot be undone.`)) {
      audioEngine.playClick();
      onDeleteProfile(id);
    }
  };

  return (
    <div className="glass-panel flex flex-col gap-6">
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <h3 className="text-sm uppercase tracking-wider font-extrabold flex items-center gap-2">
          <Users className="w-4 h-4 text-accent" style={{ color: 'var(--accent-color)' }} /> User Profile Management
        </h3>
      </div>

      {/* Profile Creation Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-black/25 rounded-xl border border-white/5 flex flex-col gap-4">
        <h4 className="text-xs uppercase tracking-wider font-bold text-muted flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <UserPlus className="w-4 h-4" /> Create New Profile
        </h4>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <input
              type="text"
              placeholder="Enter username..."
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="bg-black/45 border border-white/10 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent font-semibold"
              style={{ caretColor: 'var(--accent-color)' }}
            />
            {errorMsg && (
              <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {errorMsg}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Choose Avatar
            </span>
            <div className="grid grid-cols-6 gap-2 bg-black/20 p-2 rounded-lg border border-white/5 max-h-[85px] overflow-y-auto">
              {AVATARS.map((avatar) => (
                <button
                  type="button"
                  key={avatar}
                  onClick={() => {
                    audioEngine.playClick();
                    setSelectedAvatar(avatar);
                  }}
                  className={`text-xl p-1 rounded transition-transform hover:scale-125 ${
                    selectedAvatar === avatar ? 'bg-accent/25 border border-accent' : 'border border-transparent'
                  }`}
                  style={selectedAvatar === avatar ? { borderColor: 'var(--accent-color)' } : {}}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary py-2.5 px-4 rounded-lg font-extrabold text-sm uppercase flex items-center justify-center gap-2"
          >
            Create Profile
          </button>
        </div>
      </form>

      {/* Profiles List */}
      <div className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>
          Available Profiles
        </span>
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
          {profiles.map((p) => {
            const isActive = p.id === activeProfileId;
            return (
              <div
                key={p.id}
                onClick={() => {
                  if (!isActive) {
                    audioEngine.playClick();
                    onSwitchProfile(p.id);
                  }
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:bg-white/[0.02] ${
                  isActive
                    ? 'border-accent bg-accent/5 shadow-md shadow-accent/5'
                    : 'border-white/5 bg-black/20'
                }`}
                style={isActive ? { borderColor: 'var(--accent-color)' } : {}}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl bg-black/30 w-12 h-12 rounded-full flex items-center justify-center border border-white/5">
                    {p.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sm flex items-center gap-1.5">
                      {p.name}
                      {isActive && (
                        <UserCheck className="w-3.5 h-3.5 text-accent" style={{ color: 'var(--accent-color)' }} />
                      )}
                    </div>
                    <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Spins: <span className="text-white">{p.spinsCount}</span> | Bal: <span className="text-emerald-400 font-bold">${p.balance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset(p.id, p.name);
                    }}
                    title="Reset Profile"
                    className="p-2 rounded-lg text-white/40 hover:text-amber-400 hover:bg-amber-950/20 border border-transparent hover:border-amber-900/30 flex items-center justify-center"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    disabled={profiles.length <= 1}
                    onClick={(e) => handleDelete(p.id, p.name, e)}
                    title="Delete Profile"
                    className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 disabled:opacity-20 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;
