import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    getQuestions,
    deleteQuestion
} from "./QuestionService";

function QuestionsPage() {
    // Read the game ID from the URL.
    // Example: /games/5/questions gives gameId = "5".
    const { gameId } = useParams();

    // Stores the questions belonging to this game.
    const [questions, setQuestions] = useState([]);

    // Tracks whether the questions are loading.
    const [loading, setLoading] = useState(true);

    // Stores API error messages.
    const [error, setError] = useState("");


    // Loads questions again after an operation such as deletion.
    // This function can safely update loading/error state because
    // it is called from a user-triggered operation, not directly
    // from the initial useEffect.
    async function loadQuestions() {
        try {
            setLoading(true);
            setError("");

            // The API filters the questions using this game ID.
            const data = await getQuestions({
                gameId: gameId
            });

            setQuestions(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load questions."
            );
        } finally {
            setLoading(false);
        }
    }


    // Load questions when the page opens or gameId changes.
    useEffect(() => {
        let cancelled = false;

        async function loadInitialQuestions() {
            try {
                const data = await getQuestions({
                    gameId: gameId
                });

                // Only update state if the component is still mounted.
                if (!cancelled) {
                    setQuestions(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load questions."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadInitialQuestions();

        // Prevent state updates if the component is removed
        // before the API request has completed.
        return () => {
            cancelled = true;
        };
    }, [gameId]);


    // Deletes a question after confirmation.
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

            // Refresh the list after successful deletion.
            await loadQuestions();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to delete the question."
            );
        }
    }


    // Converts the numeric Difficulty enum into readable text.
    // Easy = 0, Medium = 1, Hard = 2.
    function getDifficultyName(difficulty) {
        const names = ["Easy", "Medium", "Hard"];

        return names[difficulty] ?? difficulty;
    }


    // Converts the numeric AnswerOption enum into a letter.
    // A = 0, B = 1, C = 2, D = 3.
    function getCorrectAnswer(correctAnswer) {
        const answers = ["A", "B", "C", "D"];

        return answers[correctAnswer] ?? correctAnswer;
    }


    return (
        <div className="py-3">

            {/* =====================================
                Page heading and introduction
                ===================================== */}

            <div className="mb-4">

                <h1>
                    Manage Questions
                </h1>

                <p className="text-muted">
                    View, create, edit and delete questions
                    belonging to this game.
                </p>

            </div>


            {/* =====================================
                Navigation and page actions
                ===================================== */}

            <div className="d-flex flex-wrap gap-2 mb-4">

                {/* Return to the My Games page. */}
                <Link
                    to="/games"
                    className="btn btn-secondary"
                >
                    Back to My Games
                </Link>

                {/* Open the form to create a new question. */}
                <Link
                    to={`/games/${gameId}/questions/create`}
                    className="btn btn-primary"
                >
                    Create Question
                </Link>

            </div>


            {/* =====================================
                Error and loading feedback
                ===================================== */}

            {/* Display errors returned by the API. */}
            {error && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {/* Display a loading message while retrieving questions. */}
            {loading && (
                <p role="status">
                    Loading questions...
                </p>
            )}


            {/* =====================================
                Questions content
                ===================================== */}

            {!loading && !error && (
                <>

                    {questions.length === 0 ? (

                        /* Empty state when the game has no questions. */
                        <div className="alert alert-info">
                            No questions found for this game.
                            Select Create Question to add one.
                        </div>

                    ) : (

                        /* Responsive table containing the questions. */
                        <div className="card">

                            <div className="card-body">

                                <h2 className="h4 mb-3">
                                    Questions
                                </h2>

                                <div className="table-responsive">

                                    <table className="table table-striped table-hover align-middle">

                                        <caption className="visually-hidden">
                                            Questions belonging to this game,
                                            including their category,
                                            difficulty and available actions.
                                        </caption>

                                        <thead className="table-light">

                                            <tr>
                                                <th scope="col">
                                                    Question
                                                </th>

                                                <th scope="col">
                                                    Category
                                                </th>

                                                <th scope="col">
                                                    Difficulty
                                                </th>

                                                <th scope="col">
                                                    Correct Answer
                                                </th>

                                                <th scope="col">
                                                    Actions
                                                </th>
                                            </tr>

                                        </thead>

                                        <tbody>

                                            {questions.map(question => (

                                                <tr key={question.questionId}>

                                                    {/* Question text acts as the row heading. */}
                                                    <th scope="row">
                                                        {question.questionText}
                                                    </th>

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

                                                        <div className="d-flex flex-wrap gap-2">

                                                            {/* View question details. */}
                                                            <Link
                                                                to={`/games/${gameId}/questions/${question.questionId}`}
                                                                className="btn btn-sm btn-outline-primary"
                                                            >
                                                                Details
                                                            </Link>

                                                            {/* Edit the question. */}
                                                            <Link
                                                                to={`/games/${gameId}/questions/${question.questionId}/edit`}
                                                                className="btn btn-sm btn-outline-warning"
                                                            >
                                                                Edit
                                                            </Link>

                                                            {/* Delete the question. */}
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        question.questionId
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        </div>

                    )}

                </>
            )}

        </div>
    );
}

export default QuestionsPage;