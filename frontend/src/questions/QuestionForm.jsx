
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    getQuestionById,
    createQuestion,
    updateQuestion
} from "../services/questionApi";

// Categories available when creating or editing a question.
const categories = [
    "Java",
    "JavaScript",
    "HTML/CSS",
    "Python",
    "Game History",
    "C#"
];

// Initial values used when creating a new question.
const initialFormData = {
    questionText: "",
    category: "",
    difficulty: 0,
    answerA: "",
    answerB: "",
    answerC: "",
    answerD: "",
    correctAnswer: 0
};

function QuestionForm() {
    // Read the game ID and optional question ID from the URL.
    const { gameId, id } = useParams();

    const navigate = useNavigate();

    // A question ID means the form is being used for editing.
    const isEditing = Boolean(id);

    // Stores all values entered into the form.
    const [formData, setFormData] = useState(initialFormData);

    // Tracks loading and form submission.
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    // Stores validation or API error messages.
    const [error, setError] = useState("");

    // Load the existing question when editing.
    useEffect(() => {
        async function loadQuestion() {
            if (!isEditing) {
                setLoading(false);
                return;
            }

            try {
                setError("");

                const data = await getQuestionById(id);

                // Make sure the question belongs to the game in the URL.
                if (String(data.gameId) !== String(gameId)) {
                    throw new Error(
                        "This question does not belong to the selected game."
                    );
                }

                // Populate the form with the existing question data.
                setFormData({
                    questionText: data.questionText,
                    category: data.category,
                    difficulty: data.difficulty,
                    answerA: data.answerA,
                    answerB: data.answerB,
                    answerC: data.answerC,
                    answerD: data.answerD,
                    correctAnswer: data.correctAnswer
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadQuestion();
    }, [id, gameId, isEditing]);

    // Update form state whenever an input changes.
    function handleChange(event) {
        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,

            // Convert enum values from strings to numbers.
            [name]:
                name === "difficulty" || name === "correctAnswer"
                    ? Number(value)
                    : value
        }));
    }

    // Submit the form to the backend.
    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSaving(true);

        try {
            // Create a copy of the form data.
            const questionData = {
                ...formData
            };

            if (isEditing) {
                // Update an existing question.
                // GameId is not sent because the backend preserves it.
                await updateQuestion(id, questionData);
            } else {
                // Create a new question and associate it with this game.
                await createQuestion({
                    ...questionData,
                    gameId: Number(gameId)
                });
            }

            // Return to the question list after a successful save.
            navigate(`/games/${gameId}/questions`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>Loading question...</p>;
    }

    return (
        <main>
            <h1>
                {isEditing ? "Edit Question" : "Create Question"}
            </h1>

            <p>
                Enter the question, its possible answers and the
                correct answer.
            </p>

            {/* Display errors returned by the API. */}
            {error && (
                <p role="alert">
                    Error: {error}
                </p>
            )}

            <form onSubmit={handleSubmit}>

                {/* Question text input. */}
                <div>
                    <label htmlFor="questionText">
                        Question
                    </label>

                    <textarea
                        id="questionText"
                        name="questionText"
                        value={formData.questionText}
                        onChange={handleChange}
                        maxLength={500}
                        required
                    />
                </div>

                {/* Category selection. */}
                <div>
                    <label htmlFor="category">
                        Category
                    </label>

                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a category</option>

                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Difficulty selection. Values match the backend enum:
                    Easy = 0, Medium = 1, Hard = 2. */}
                <div>
                    <label htmlFor="difficulty">
                        Difficulty
                    </label>

                    <select
                        id="difficulty"
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                    >
                        <option value={0}>Easy</option>
                        <option value={1}>Medium</option>
                        <option value={2}>Hard</option>
                    </select>
                </div>

                {/* Answer A input. */}
                <div>
                    <label htmlFor="answerA">
                        Answer A
                    </label>

                    <input
                        id="answerA"
                        name="answerA"
                        type="text"
                        value={formData.answerA}
                        onChange={handleChange}
                        maxLength={300}
                        required
                    />
                </div>

                {/* Answer B input. */}
                <div>
                    <label htmlFor="answerB">
                        Answer B
                    </label>

                    <input
                        id="answerB"
                        name="answerB"
                        type="text"
                        value={formData.answerB}
                        onChange={handleChange}
                        maxLength={300}
                        required
                    />
                </div>

                {/* Answer C input. */}
                <div>
                    <label htmlFor="answerC">
                        Answer C
                    </label>

                    <input
                        id="answerC"
                        name="answerC"
                        type="text"
                        value={formData.answerC}
                        onChange={handleChange}
                        maxLength={300}
                        required
                    />
                </div>

                {/* Answer D input. */}
                <div>
                    <label htmlFor="answerD">
                        Answer D
                    </label>

                    <input
                        id="answerD"
                        name="answerD"
                        type="text"
                        value={formData.answerD}
                        onChange={handleChange}
                        maxLength={300}
                        required
                    />
                </div>

                {/* Select which answer is correct.
                    Values match the backend enum:
                    A = 0, B = 1, C = 2, D = 3. */}
                <div>
                    <label htmlFor="correctAnswer">
                        Correct Answer
                    </label>

                    <select
                        id="correctAnswer"
                        name="correctAnswer"
                        value={formData.correctAnswer}
                        onChange={handleChange}
                    >
                        <option value={0}>A</option>
                        <option value={1}>B</option>
                        <option value={2}>C</option>
                        <option value={3}>D</option>
                    </select>
                </div>

                {/* Submit the form. Disable the button while saving. */}
                <button type="submit" disabled={saving}>
                    {saving
                        ? "Saving..."
                        : isEditing
                            ? "Save Changes"
                            : "Create Question"}
                </button>

                {/* Return to the question list without saving. */}
                <Link to={`/games/${gameId}/questions`}>
                    Cancel
                </Link>
            </form>
        </main>
    );
}

export default QuestionForm;
