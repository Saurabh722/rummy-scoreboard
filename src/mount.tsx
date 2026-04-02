/**
 * Micro-frontend entry point.
 *
 * Usage in a host app (after consuming via Module Federation):
 *
 *   import { mount } from 'rummyScoreboard/mount';
 *   const unmount = mount(document.getElementById('rummy-root'), {
 *     basePath: '/rummy',   // optional: sub-path in the host's router
 *   });
 *   // later:
 *   unmount();
 *
 * The module also exports the raw <RummyApp /> React component so a React
 * host can render it directly inside its own tree.
 */

import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { RummyApp } from './RummyApp';
import './index.css';

export interface MountOptions {
  /** Mount path prefix when embedded in a host (e.g. '/rummy'). Defaults to '/'. */
  basePath?: string;
}

/**
 * Imperatively mount the Rummy Scoreboard into any DOM element.
 * Returns an unmount function for clean-up.
 */
export function mount(el: HTMLElement, options: MountOptions = {}): () => void {
  const root: Root = createRoot(el);
  root.render(
    <StrictMode>
      <Provider store={store}>
        <RummyApp basePath={options.basePath ?? '/'} />
      </Provider>
    </StrictMode>,
  );
  return () => root.unmount();
}

// Also re-export the component so React hosts can embed it without imperative API
export { RummyApp };
export { store };
