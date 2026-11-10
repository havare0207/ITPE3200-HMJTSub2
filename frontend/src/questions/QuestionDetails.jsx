
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getQuestionById } from "../services/questionApi";

function QuestionDetails() {
    // Get the game ID and question ID from the URL.
    const { gameId, id } = useParams();

    // Store the question returned by the API.
    const [question, setQuestion] = useState(null);

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

    if (loading) {
        return <p>Loading question details...</p>;
    }

    if (error) {
        return (
            <main>
                <p role="alert">Error: {error}</p>

                <Link to={`/games/${gameId}/questions`}>
                    Back to Questions
                </Link>
            </main>
        );
    }

    // Do not render the question until it has been loaded.
    if (!question) {
        return <p>Question not found.</p>;
    }

    return (
        <main>
            <h1>Question Details</h1>

            {/* Display the main question information. */}
            <section>
                <h2>{question.questionText}</h2>

                <p>
                    <strong>Category:</strong> {question.category}
                </p>

                <p>
                    <strong>Difficulty:</strong>{" "}
                    {getDifficultyName(question.difficulty)}
                </p>

                <p>
                    <strong>Game:</strong> {question.gameName}
                </p>
            </section>

            {/* Display all four possible answers. */}
            <section>
                <h2>Answer Options</h2>

                <ul>
                    <li>
                        A: {question.answerA}
                    </li>

                    <li>
                        B: {question.answerB}
                    </li>

                    <li>
                        C: {question.answerC}
                    </li>

                    <li>
                        D: {question.answerD}
                    </li>
                </ul>

                {/* Display the correct answer. */}
                <p>
                    <strong>Correct Answer:</strong>{" "}
                    {getCorrectAnswer(question.correctAnswer)}
                </p>
            </section>

            {/* Navigate to the edit form. */}
            <Link
                to={`/games/${gameId}/questions/${question.questionId}/edit`}
            >
                Edit Question
            </Link>

            {" | "}

            {/* Return to the question list. */}
            <Link to={`/games/${gameId}/questions`}>
                Back to Questions
            </Link>
        </main>
    );
}

export default QuestionDetails;
