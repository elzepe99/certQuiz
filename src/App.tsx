import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DeckPicker } from '@/routes/DeckPicker';
import { QuizView } from '@/routes/QuizView';
import { CompletionScreen } from '@/routes/CompletionScreen';
import { ReviewScreen } from '@/routes/ReviewScreen';

export function App() {
  return (
    <BrowserRouter>
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
