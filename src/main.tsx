import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { GameProvider } from './store/GameContext';
import './styles.css';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <GameProvider>
    <App />
  </GameProvider>,
);
