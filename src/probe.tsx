import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ProbePage } from './ui/probe/ProbePage';
import './index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Missing probe root element');
createRoot(container).render(
  <StrictMode>
    <ProbePage />
  </StrictMode>,
);
