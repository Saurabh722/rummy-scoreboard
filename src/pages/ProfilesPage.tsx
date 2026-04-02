import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import {
  addProfile,
  editProfile,
  deleteProfile,
  addGroup,
  editGroup,
  deleteGroup,
  addMemberToGroup,
  removeMemberFromGroup,
} from '../features/profiles/profilesSlice';
import { Button } from '../components/common/Button';

// ─── Players Tab ──────────────────────────────────────────────────────────────
function PlayersTab() {
  const dispatch = useAppDispatch();
  const profiles = useAppSelector((s) => s.profiles.profiles);

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    if (profiles.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      alert('A player with this name already exists.');
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
    if (window.confirm(`Delete player "${name}"?`)) {
      dispatch(deleteProfile(id));
    }
  };

  return (
    <div className="space-y-5">
      {/* Add new player */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
          Add Player
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

      {/* Player list */}
      {profiles.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <div className="text-4xl mb-3">👤</div>
          <p className="font-medium">No players saved yet</p>
          <p className="text-sm mt-1">Add your regular players above</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}

// ─── Groups Tab ───────────────────────────────────────────────────────────────
function GroupsTab() {
  const dispatch = useAppDispatch();
  const profiles = useAppSelector((s) => s.profiles.profiles);
  const groups = useAppSelector((s) => s.profiles.groups);

  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  const handleAddGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    if (groups.some((g) => g.name.toLowerCase() === name.toLowerCase())) {
      alert('A group with this name already exists.');
      return;
    }
    dispatch(addGroup(name));
    setNewGroupName('');
  };

  const handleEditGroup = (id: string) => {
    const name = editingGroupName.trim();
    if (!name) return;
    dispatch(editGroup({ id, name }));
    setEditingGroupId(null);
    setEditingGroupName('');
  };

  const handleDeleteGroup = (id: string, name: string) => {
    if (window.confirm(`Delete group "${name}"?`)) {
      dispatch(deleteGroup(id));
      if (expandedGroupId === id) setExpandedGroupId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Create group */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
          Create Group
        </h2>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Group name (e.g. Family, Office)"
            value={newGroupName}
            maxLength={30}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddGroup(); }}
          />
          <Button variant="secondary" disabled={!newGroupName.trim()} onClick={handleAddGroup}>
            Create
          </Button>
        </div>
        {profiles.length === 0 && (
          <p className="text-xs text-amber-400/70 mt-2">
            ⚠ Add players in the Players tab first, then assign them to groups.
          </p>
        )}
      </div>

      {/* Group list */}
      {groups.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <div className="text-4xl mb-3">👥</div>
          <p className="font-medium">No groups yet</p>
          <p className="text-sm mt-1">Create a group to quickly add multiple players</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {groups.map((group) => {
              const members = profiles.filter((p) => group.memberIds.includes(p.id));
              const nonMembers = profiles.filter((p) => !group.memberIds.includes(p.id));
              const isExpanded = expandedGroupId === group.id;

              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="card"
                >
                  {/* Group header */}
                  {editingGroupId === group.id ? (
                    <div className="flex gap-2 mb-2">
                      <input
                        className="input flex-1"
                        value={editingGroupName}
                        maxLength={30}
                        autoFocus
                        onChange={(e) => setEditingGroupName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditGroup(group.id);
                          if (e.key === 'Escape') setEditingGroupId(null);
                        }}
                      />
                      <Button size="sm" variant="secondary" onClick={() => handleEditGroup(group.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingGroupId(null)}>
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center text-sm flex-shrink-0">
                        👥
                      </div>
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                      >
                        <div className="font-bold text-white">{group.name}</div>
                        <div className="text-xs text-white/40">{members.length} members</div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                          className="text-white/40 hover:text-gold transition-colors p-2"
                          title="Manage members"
                        >
                          {isExpanded ? '▲' : '▼'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingGroupId(group.id);
                            setEditingGroupName(group.name);
                          }}
                          className="text-white/40 hover:text-gold transition-colors p-2"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id, group.name)}
                          className="text-white/40 hover:text-red-400 transition-colors p-2"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Members preview (collapsed) */}
                  {!isExpanded && members.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {members.map((m) => (
                        <span key={m.id} className="text-xs bg-card-bg border border-card-border text-white/70 px-2 py-1 rounded-full">
                          {m.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expanded member management */}
                  {isExpanded && (
                    <div className="space-y-3 pt-1">
                      {/* Current members */}
                      {members.length > 0 ? (
                        <div>
                          <div className="text-xs text-white/50 mb-2 font-semibold uppercase tracking-wide">Members</div>
                          <div className="flex flex-wrap gap-2">
                            {members.map((m) => (
                              <span
                                key={m.id}
                                className="flex items-center gap-1 text-sm bg-green-900/30 border border-green-700/40 text-green-300 px-3 py-1 rounded-full"
                              >
                                {m.name}
                                <button
                                  onClick={() => dispatch(removeMemberFromGroup({ groupId: group.id, profileId: m.id }))}
                                  className="ml-1 text-green-400/60 hover:text-red-400 transition-colors"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-white/30 italic">No members yet.</p>
                      )}

                      {/* Add members from remaining profiles */}
                      {nonMembers.length > 0 && (
                        <div>
                          <div className="text-xs text-white/50 mb-2 font-semibold uppercase tracking-wide">Add Members</div>
                          <div className="flex flex-wrap gap-2">
                            {nonMembers.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => dispatch(addMemberToGroup({ groupId: group.id, profileId: p.id }))}
                                className="text-sm bg-card-bg border border-card-border text-white/60 hover:border-gold/50 hover:text-gold px-3 py-1 rounded-full transition-all"
                              >
                                + {p.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {profiles.length === 0 && (
                        <p className="text-xs text-amber-400/70">
                          Add players in the Players tab first.
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ProfilesPage() {
  const [tab, setTab] = useState<'players' | 'groups'>('players');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profiles</h1>
        <p className="text-sm text-white/50 mt-1">
          Save players &amp; groups for quick game setup
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-card-bg rounded-xl p-1 border border-card-border">
        {(['players', 'groups'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              tab === t
                ? 'bg-gold text-felt-darker'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {t === 'players' ? '👤 Players' : '👥 Groups'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {tab === 'players' ? <PlayersTab /> : <GroupsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

