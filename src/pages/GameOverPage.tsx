import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAppSelector } from '../hooks/useAppStore';
import { Button } from '../components/common/Button';
import { GAME_TYPE_LABELS } from '../constants/gameRules';
import { buildScoreboardText } from '../utils/gameLogic';

export function GameOverPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const scoreboardRef = useRef<HTMLDivElement>(null);

  const game = useAppSelector((s) => s.games.games.find((g) => g.id === id));

  if (!game) {
    return (
      <div className="text-center py-12 text-white/40">
        <p>Game not found</p>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </div>
    );
  }

  const winner = game.players.find((p) => p.id === game.winnerId);
  const sorted = [...game.players].sort((a, b) => a.totalScore - b.totalScore);
  const gameLabel = GAME_TYPE_LABELS[game.type];

  // ─── Export handlers ──────────────────────────────────────────────────────

  const handleScreenshot = async () => {
    if (!scoreboardRef.current) return;
    try {
      const canvas = await html2canvas(scoreboardRef.current, {
        backgroundColor: '#0b1f12',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `rummy-scoreboard-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('Screenshot failed. Please try again.');
    }
  };

  const handlePDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 15;
    let y = margin;

    doc.setFontSize(18);
    doc.setTextColor(30, 87, 42);
    doc.text('Rummy Scoreboard', margin, y);
    y += 8;

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`${gameLabel} · ${game.rounds.length} rounds · ${new Date().toLocaleDateString()}`, margin, y);
    y += 10;

    // Winner banner
    if (winner) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`🏆 Winner: ${winner.name} (${winner.totalScore} pts)`, margin, y);
      y += 10;
    }

    // Table header
    const colW = (210 - margin * 2) / (game.players.length + 1);
    doc.setFontSize(10);
    doc.setFillColor(30, 87, 42);
    doc.rect(margin, y, 210 - margin * 2, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Round', margin + 2, y + 5.5);
    game.players.forEach((p, i) => {
      doc.text(p.name.slice(0, 10), margin + colW * (i + 1) + 2, y + 5.5);
    });
    y += 9;

    // Rows
    game.rounds.forEach((round, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(240, 248, 243);
        doc.rect(margin, y, 210 - margin * 2, 7, 'F');
      }
      doc.setTextColor(0, 0, 0);
      doc.text(`#${round.roundNumber}`, margin + 2, y + 5);
      game.players.forEach((p, i) => {
        const rs = round.scores.find((s) => s.playerId === p.id);
        const score = rs ? String(rs.score) : '–';
        doc.text(score, margin + colW * (i + 1) + 2, y + 5);
      });
      y += 8;

      if (y > 270) {
        doc.addPage();
        y = margin;
      }
    });

    // Totals
    y += 2;
    doc.setFillColor(255, 215, 0);
    doc.rect(margin, y, 210 - margin * 2, 8, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('TOTAL', margin + 2, y + 5.5);
    game.players.forEach((p, i) => {
      doc.text(String(p.totalScore), margin + colW * (i + 1) + 2, y + 5.5);
    });

    doc.save(`rummy-scoreboard-${Date.now()}.pdf`);
  };

  const handleWhatsApp = () => {
    const text = buildScoreboardText(game, gameLabel);
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    const text = buildScoreboardText(game, gameLabel);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Rummy Scoreboard', text });
        return;
      } catch {
        // Fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    } catch {
      alert('Could not share. Please screenshot manually.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Winner celebration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="text-center py-6"
      >
        <div className="text-6xl mb-3">🏆</div>
        <h1 className="text-3xl font-bold text-gold">
          {winner ? winner.name : 'Game Over'}
        </h1>
        {winner && (
          <p className="text-white/60 mt-1">
            wins with <span className="text-white font-bold">{winner.totalScore} points</span>
          </p>
        )}
        <p className="text-white/40 text-sm mt-2">
          {gameLabel} · {game.rounds.length} rounds played
        </p>
      </motion.div>

      {/* Final scoreboard (for screenshot) */}
      <div ref={scoreboardRef} className="card space-y-0 overflow-hidden p-0">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-card-border bg-card-surface">
          <span className="text-lg">🃏</span>
          <span className="font-bold text-gold text-sm">Final Scoreboard · {gameLabel}</span>
        </div>
        {sorted.map((player, idx) => {
          const isWinner = player.id === game.winnerId;
          return (
            <div
              key={player.id}
              className={`flex items-center gap-4 px-4 py-3 border-b border-card-border last:border-0 ${
                isWinner ? 'bg-gold/10' : idx % 2 === 0 ? 'bg-card-bg' : 'bg-card-surface/30'
              }`}
            >
              <span className="w-6 text-center font-bold text-white/50">{idx + 1}</span>
              <span
                className={`flex-1 font-bold ${
                  isWinner ? 'text-gold' : player.isEliminated ? 'text-white/40 line-through' : 'text-white'
                }`}
              >
                {isWinner ? '👑 ' : ''}{player.name}
              </span>
              <span className={`text-xl font-bold ${isWinner ? 'text-gold' : 'text-white'}`}>
                {player.totalScore}
              </span>
              <span className="text-xs text-white/40">pts</span>
            </div>
          );
        })}
      </div>

      {/* Export / share buttons */}
      <div className="space-y-3">
        <div className="text-xs text-white/40 uppercase tracking-wider text-center">
          Export &amp; Share
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={handleScreenshot}>
            📸 Screenshot
          </Button>
          <Button variant="secondary" onClick={handlePDF}>
            📄 PDF
          </Button>
          <Button variant="secondary" onClick={handleWhatsApp}>
            💬 WhatsApp
          </Button>
          <Button variant="secondary" onClick={handleShare}>
            🔗 Share
          </Button>
        </div>
      </div>

      {/* Navigate back */}
      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => navigate(`/game/${id}/history`)} className="flex-1">
          View History
        </Button>
        <Button onClick={() => navigate('/setup')} className="flex-1">
          New Game
        </Button>
      </div>
      <Button variant="ghost" fullWidth onClick={() => navigate('/')}>
        Home
      </Button>
    </div>
  );
}
