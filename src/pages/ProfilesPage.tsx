import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { addProfile, editProfile, deleteProfile } from '../features/profiles/profilesSlice';
import { Button } from '../components/common/Button';

export function ProfilesPage() {
  const dispatch = useAppDispatch();
  const profiles = useAppSelector((s) => s.profiles.profiles);

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    if (profiles.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      alert('A profile with this name already exists.');
      return;
    }
    dispatch(addProfile(name));
    setNewName('');
  };

  const handleEdit = (id: string) => {
    const name = editingName.trim();
    if (!name) return;
    dispatch(editProfile({ id, name }));
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete profile "${name}"?`)) {
      dispatch(deleteProfile(id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Player Profiles</h1>
        <p className="text-sm text-white/50 mt-1">
          Save players for quick game setup
        </p>
      </div>

      {/* Add new profile */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
          Add Profile
        </h2>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Player name"
            value={newName}
            maxLength={20}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          />
          <Button variant="secondary" disabled={!newName.trim()} onClick={handleAdd}>
            Add
          </Button>
        </div>
      </div>

      {/* Profile list */}
      {profiles.length === 0 && (
        <div className="text-center py-12 text-white/30">
          <div className="text-4xl mb-3">👤</div>
          <p className="font-medium">No profiles yet</p>
          <p className="text-sm mt-1">Add your regular players above</p>
        </div>
      )}

      <div className="space-y-2">
        <AnimatePresence>
          {profiles.map((profile) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="card"
            >
              {editingId === profile.id ? (
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    value={editingName}
                    maxLength={20}
                    autoFocus
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEdit(profile.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                  />
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(profile.id)}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    ×
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gold/20 text-gold font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {profile.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{profile.name}</div>
                    <div className="text-xs text-white/40">
                      {profile.gamesPlayed} games · {profile.wins} wins
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingId(profile.id);
                        setEditingName(profile.name);
                      }}
                      className="text-white/40 hover:text-gold transition-colors p-2"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(profile.id, profile.name)}
                      className="text-white/40 hover:text-red-400 transition-colors p-2"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
