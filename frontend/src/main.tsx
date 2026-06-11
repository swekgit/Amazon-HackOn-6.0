import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// Keep whichever CSS import you originally had here (e.g., globals.css or index.css)
import './styles/globals.css'; 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);