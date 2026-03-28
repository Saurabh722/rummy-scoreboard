import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { GameSetupPage } from './pages/GameSetupPage';
import { ScoreboardPage } from './pages/ScoreboardPage';
import { RoundHistoryPage } from './pages/RoundHistoryPage';
import { GameOverPage } from './pages/GameOverPage';
import { ProfilesPage } from './pages/ProfilesPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<GameSetupPage />} />
          <Route path="/game/:id" element={<ScoreboardPage />} />
          <Route path="/game/:id/history" element={<RoundHistoryPage />} />
          <Route path="/game/:id/over" element={<GameOverPage />} />
          <Route path="/profiles" element={<ProfilesPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
