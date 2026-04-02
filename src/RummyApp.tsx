/**
 * RummyApp — portable root component.
 *
 * - When basePath === '/' (standalone) it uses BrowserRouter so deep links work.
 * - When a custom basePath is provided (embedded in a host) it uses MemoryRouter
 *   so it doesn't interfere with the host's routing.
 */
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { GameSetupPage } from './pages/GameSetupPage';
import { ScoreboardPage } from './pages/ScoreboardPage';
import { RoundHistoryPage } from './pages/RoundHistoryPage';
import { GameOverPage } from './pages/GameOverPage';
import { ProfilesPage } from './pages/ProfilesPage';

interface RummyAppProps {
  /**
   * When running standalone this should be '/'.
   * When embedded inside a host app, pass the sub-path (e.g. '/rummy') so the
   * app knows it is embedded and switches to MemoryRouter.
   */
  basePath?: string;
}

const AppRoutes = () => (
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
);

export function RummyApp({ basePath = '/' }: RummyAppProps) {
  if (basePath === '/') {
    // Standalone mode — full URL routing
    return (
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    );
  }

  // Embedded mode — isolated memory routing, no conflict with host router
  return (
    <MemoryRouter initialEntries={['/']}>
      <AppRoutes />
    </MemoryRouter>
  );
}
