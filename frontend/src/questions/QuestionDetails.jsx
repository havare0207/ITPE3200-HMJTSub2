
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getQuestionById } from "../services/questionApi";

function QuestionDetails() {
    // Read the game ID and question ID from the URL.
    const { gameId, id } = useParams();

    // Stores the question returned by the API.
    const [question, setQuestion] = useState(null);

    // Tracks loading and error states.
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Convert numeric difficulty values into readable names.
    function getDifficultyName(difficulty) {
        const names = ["Easy", "Medium", "Hard"];

        return names[difficulty] ?? difficulty;
    }

    // Convert the numeric answer enum into a letter.
    function getCorrectAnswer(correctAnswer) {
        const answers = ["A", "B", "C", "D"];

        return answers[correctAnswer] ?? correctAnswer;
    }

    // Load the selected question when the page opens.
    useEffect(() => {
        async function loadQuestion() {
            try {
                setLoading(true);
                setError("");

                const data = await getQuestionById(id);

                // Check that the question belongs to the selected game.
                if (String(data.gameId) !== String(gameId)) {
                    throw new Error(
                        "This question does not belong to the selected game."
                    );
                }

                setQuestion(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadQuestion();
    }, [id, gameId]);

    // Display a loading message while retrieving the question.
    if (loading) {
        return (
            <div className="py-3">
                <p role="status">Loading question details...</p>
            </div>
        );
    }

    // Display an error if the API request fails.
    if (error) {
        return (
            <div className="py-3">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>

                <Link
                    to={`/games/${gameId}/questions`}
                    className="btn btn-secondary"
                >
                    Back to Questions
                </Link>
            </div>
        );
    }

    // Do not render the question until it has been loaded.
    if (!question) {
        return (
            <div className="py-3">
                <div className="alert alert-warning">
                    Question not found.
                </div>

                <Link
                    to={`/games/${gameId}/questions`}
                    className="btn btn-secondary"
                >
                    Back to Questions
                </Link>
            </div>
        );
    }

    return (
        <div className="py-3">

            {/* Main page heading. */}
            <div className="mb-4">
                <h1>Question Details</h1>

                <p className="text-muted">
                    View the full information for this question.
                </p>
            </div>

            {/* Card containing the main question information. */}
            <div className="card mb-4">
                <div className="card-body">

                    <h2 className="h4 mb-3">
                        {question.questionText}
                    </h2>

                    <dl className="row mb-0">

                        {/* Display the category. */}
                        <dt className="col-sm-3">
                            Category
                        </dt>

                        <dd className="col-sm-9">
                            {question.category}
                        </dd>

                        {/* Display the difficulty. */}
                        <dt className="col-sm-3">
                            Difficulty
                        </dt>

                        <dd className="col-sm-9">
                            {getDifficultyName(question.difficulty)}
                        </dd>

                        {/* Display the associated game. */}
                        <dt className="col-sm-3">
                            Game
                        </dt>

                        <dd className="col-sm-9">
                            {question.gameName}
                        </dd>

                    </dl>
                </div>
            </div>

            {/* Card containing the four possible answers. */}
            <div className="card mb-4">
                <div className="card-body">

                    <h2 className="h4 mb-3">
                        Answer Options
                    </h2>

                    <ul className="list-group mb-3">

                        {/* Answer A. */}
                        <li className="list-group-item">
                            <strong>A:</strong> {question.answerA}
                        </li>

                        {/* Answer B. */}
                        <li className="list-group-item">
                            <strong>B:</strong> {question.answerB}
                        </li>

                        {/* Answer C. */}
                        <li className="list-group-item">
                            <strong>C:</strong> {question.answerC}
                        </li>

                        {/* Answer D. */}
                        <li className="list-group-item">
                            <strong>D:</strong> {question.answerD}
                        </li>

                    </ul>

                    {/* Highlight the correct answer. */}
                    <div className="alert alert-success mb-0">
                        <strong>Correct Answer:</strong>{" "}
                        {getCorrectAnswer(question.correctAnswer)}
                    </div>

                </div>
            </div>

            {/* Page navigation actions. */}
            <div className="d-flex flex-wrap gap-2">

                {/* Open the edit form for this question. */}
                <Link
                    to={`/games/${gameId}/questions/${question.questionId}/edit`}
                    className="btn btn-primary"
                >
                    Edit Question
                </Link>

                {/* Return to the game's question list. */}
                <Link
                    to={`/games/${gameId}/questions`}
                    className="btn btn-secondary"
                >
                    Back to Questions
                </Link>

            </div>
        </div>
    );
}

export default QuestionDetails;
