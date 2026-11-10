
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './home/HomePage';
import QuestionsPage from './questions/QuestionsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/questions" element={<QuestionsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
