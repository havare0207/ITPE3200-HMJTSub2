
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    getQuestions,
    deleteQuestion
} from "../services/questionApi";

import QuestionFilters from "./ExploreQuestionsFilters";

function QuestionsPage() {
    // Read the game ID from the current URL.
    // Example: /games/5/questions gives gameId = "5".
    const { gameId } = useParams();

    const navigate = useNavigate();

    // Stores the questions returned by the API.
    const [questions, setQuestions] = useState([]);

    // Stores the currently selected search filters.
    const [filters, setFilters] = useState({
        searchString: "",
        category: "",
        difficulty: ""
    });

    // Tracks whether questions are currently loading.
    const [loading, setLoading] = useState(true);

    // Stores an error message if an API request fails.
    const [error, setError] = useState("");

    // Loads questions for the current game.
    const loadQuestions = useCallback(async (currentFilters = {}) => {
        try {
            setLoading(true);
            setError("");

            // Include gameId so only questions for this game are requested.
            const data = await getQuestions({
                ...currentFilters,
                gameId: gameId
            });

            setQuestions(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [gameId]);

    // Load questions when the page opens or the game ID changes.
    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    // Handles the search form submission.
    function handleSearch(event) {
        event.preventDefault();

        loadQuestions(filters);
    }

    // Clears the search filters and reloads all questions for this game.
    function handleClear() {
        const emptyFilters = {
            searchString: "",
            category: "",
            difficulty: ""
        };

        setFilters(emptyFilters);
        loadQuestions(emptyFilters);
    }

    // Deletes a question after the user confirms the action.
    async function handleDelete(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this question?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await deleteQuestion(id);

            // Refresh the question list after successful deletion.
            await loadQuestions(filters);
        } catch (err) {
            setError(err.message);
        }
    }

    // Converts the numeric difficulty enum into readable text.
    function getDifficultyName(difficulty) {
        const difficultyNames = ["Easy", "Medium", "Hard"];

        return difficultyNames[difficulty] ?? difficulty;
    }

    // Converts the numeric answer enum into a letter.
    function getCorrectAnswer(correctAnswer) {
        const answers = ["A", "B", "C", "D"];

        return answers[correctAnswer] ?? correctAnswer;
    }

    return (
        <main>
            <h1>Manage Questions</h1>

            <p>
                View, search, create, edit and delete questions
                belonging to this game.
            </p>

            {/* Return to the previous page, normally My Games. */}
            <button
                type="button"
                onClick={() => navigate(-1)}
            >
                Back to My Games
            </button>

            {/* Navigate to the form for creating a new question. */}
            <Link to={`/games/${gameId}/questions/create`}>
                <button type="button">
                    Create Question
                </button>
            </Link>

            {/* Search and filtering controls. */}
            <QuestionFilters
                filters={filters}
                setFilters={setFilters}
                onSearch={handleSearch}
                onClear={handleClear}
            />

            {/* Display a loading message while the API request runs. */}
            {loading && <p>Loading questions...</p>}

            {/* Display API errors to the user. */}
            {error && (
                <p role="alert">
                    Error: {error}
                </p>
            )}

            {/* Display the questions once loading has finished. */}
            {!loading && !error && (
                <>
                    {questions.length === 0 ? (
                        <p>No questions found for this game.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th>Category</th>
                                    <th>Difficulty</th>
                                    <th>Correct Answer</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {questions.map(question => (
                                    <tr key={question.questionId}>
                                        <td>
                                            {question.questionText}
                                        </td>

                                        <td>
                                            {question.category}
                                        </td>

                                        <td>
                                            {getDifficultyName(
                                                question.difficulty
                                            )}
                                        </td>

                                        <td>
                                            {getCorrectAnswer(
                                                question.correctAnswer
                                            )}
                                        </td>

                                        <td>
                                            {/* View the question details. */}
                                            <Link
                                                to={`/games/${gameId}/questions/${question.questionId}`}
                                            >
                                                Details
                                            </Link>

                                            {" | "}

                                            {/* Edit the selected question. */}
                                            <Link
                                                to={`/games/${gameId}/questions/${question.questionId}/edit`}
                                            >
                                                Edit
                                            </Link>

                                            {" | "}

                                            {/* Delete the selected question. */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(question.questionId)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </main>
    );
}

export default QuestionsPage;
