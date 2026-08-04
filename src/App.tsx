import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DeckPicker } from '@/routes/DeckPicker';
import { QuizView } from '@/routes/QuizView';
import { CompletionScreen } from '@/routes/CompletionScreen';
import { ReviewScreen } from '@/routes/ReviewScreen';

export function App() {
  // basename must track Vite's `base` (/certQuiz/ on GitHub Pages, / elsewhere).
  // Without it the router never matches a deep link — /certQuiz/deck/x falls
  // through to the catch-all and redirects to the picker.
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<DeckPicker />} />
        <Route path="/deck/:deckId" element={<QuizView />} />
        <Route path="/deck/:deckId/review" element={<ReviewScreen />} />
        <Route path="/deck/:deckId/complete" element={<CompletionScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
