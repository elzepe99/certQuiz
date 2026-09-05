import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { applyQuestionFont, loadQuestionFont } from '@/lib/prefs';
import './styles/index.css';

// Before the first render, so a reader who has chosen a font never sees a
// frame of the default one.
applyQuestionFont(loadQuestionFont());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
