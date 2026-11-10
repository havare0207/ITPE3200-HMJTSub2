

import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./home/HomePage";

import QuestionsPage from "./questions/QuestionsPage";
import QuestionForm from "./questions/QuestionForm";
import QuestionDetails from "./questions/QuestionDetails";

function App() {
    return (
        // BrowserRouter enables navigation using URL paths.
        <BrowserRouter>
            <Routes>

                {/* Home page. */}
                <Route
                    path="/"
                    element={<HomePage />}
                />

                {/* List and manage questions for a selected game. */}
                <Route
                    path="/games/:gameId/questions"
                    element={<QuestionsPage />}
                />

                {/* Create a new question for a selected game. */}
                <Route
                    path="/games/:gameId/questions/create"
                    element={<QuestionForm />}
                />

                {/* View the details of one question. */}
                <Route
                    path="/games/:gameId/questions/:id"
                    element={<QuestionDetails />}
                />

                {/* Edit an existing question. */}
                <Route
                    path="/games/:gameId/questions/:id/edit"
                    element={<QuestionForm />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
