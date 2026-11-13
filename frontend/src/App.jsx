

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./shared/Layout";
import HomePage from "./home/HomePage";
import CategoriesPage from "./categories/CategoriesPage";

import ExploreQuestionsPage from "./questions/ExploreQuestionsPage";
import QuestionsPage from "./questions/QuestionsPage";
import QuestionForm from "./questions/QuestionForm";
import QuestionDetails from "./questions/QuestionDetails";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Shared layout: navigation and footer */}
                <Route element={<Layout />}>

                    {/* Home page */}
                    <Route
                        path="/"
                        element={<HomePage />}
                    />
                   
                    {/* Categories page */}
                    <Route
                        path="/categories"
                        element={<CategoriesPage />}
                    />

                    {/* Explore all questions */}
                    <Route
                        path="/explore-questions"
                        element={<ExploreQuestionsPage />}
                    />

                    {/* Manage questions for a selected game */}
                    <Route
                        path="/games/:gameId/questions"
                        element={<QuestionsPage />}
                    />

                    {/* Create a question */}
                    <Route
                        path="/games/:gameId/questions/create"
                        element={<QuestionForm />}
                    />

                    {/* View question details */}
                    <Route
                        path="/games/:gameId/questions/:id"
                        element={<QuestionDetails />}
                    />

                    {/* Edit a question */}
                    <Route
                        path="/games/:gameId/questions/:id/edit"
                        element={<QuestionForm />}
                    />

                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;

