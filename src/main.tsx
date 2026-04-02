import { store } from './app/store';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RummyApp } from './RummyApp';
import './index.css';

// Standalone bootstrap — when the app is loaded directly (not as a remote)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RummyApp basePath="/" />
    </Provider>
  </StrictMode>,
);
