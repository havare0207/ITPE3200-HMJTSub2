
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

    // If an ID exists, the form is being used to edit a question.
    const isEditing = Boolean(id);

    // Stores the values entered into the form.
    const [formData, setFormData] = useState(initialFormData);

    // Tracks loading and form submission.
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    // Stores validation and API error messages.
    const [error, setError] = useState("");

    // Load an existing question when editing.
    useEffect(() => {
        async function loadQuestion() {
            if (!isEditing) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const data = await getQuestionById(id);

                // Check that the question belongs to the game in the URL.
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

            // Convert enum values from strings into numbers.
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
                // The backend preserves its original GameId.
                await updateQuestion(id, questionData);
            } else {
                // Create a new question and associate it with this game.
                await createQuestion({
                    ...questionData,
                    gameId: Number(gameId)
                });
            }

            // Return to the game's question list after saving.
            navigate(`/games/${gameId}/questions`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    // Display a loading message while retrieving an existing question.
    if (loading) {
        return (
            <div className="py-3">
                <p role="status">Loading question...</p>
            </div>
        );
    }

    // Display an error if the question could not be loaded.
    if (error && isEditing && !formData.questionText) {
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

    return (
        <div className="py-3">

            {/* Page heading changes depending on the form mode. */}
            <div className="mb-4">
                <h1>
                    {isEditing ? "Edit Question" : "Create Question"}
                </h1>

                <p className="text-muted">
                    Enter the question, its possible answers and
                    the correct answer.
                </p>

                <p className="text-muted">
                    Fields marked with <span className="text-danger">*</span>
                    are required.
                </p>
            </div>

            {/* Card containing the question form. */}
            <div className="card">
                <div className="card-body">

                    {/* Display API errors or validation errors. */}
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="row g-3">

                            {/* Question text. */}
                            <div className="col-12">
                                <label
                                    htmlFor="questionText"
                                    className="form-label"
                                >
                                    Question <span className="text-danger">*</span>
                                </label>

                                <textarea
                                    id="questionText"
                                    name="questionText"
                                    className="form-control"
                                    rows="3"
                                    value={formData.questionText}
                                    onChange={handleChange}
                                    maxLength={500}
                                    required
                                />
                            </div>

                            {/* Category selection. */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="category"
                                    className="form-label"
                                >
                                    Category <span className="text-danger">*</span>
                                </label>

                                <select
                                    id="category"
                                    name="category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        -- Select a category --
                                    </option>

                                    {categories.map(category => (
                                        <option
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Difficulty selection. */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="difficulty"
                                    className="form-label"
                                >
                                    Difficulty <span className="text-danger">*</span>
                                </label>

                                <select
                                    id="difficulty"
                                    name="difficulty"
                                    className="form-select"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                    required
                                >
                                    {/* Values match the backend enum. */}
                                    <option value={0}>Easy</option>
                                    <option value={1}>Medium</option>
                                    <option value={2}>Hard</option>
                                </select>
                            </div>

                            {/* Answer options are grouped using a fieldset. */}
                            <div className="col-12">
                                <fieldset className="border rounded p-3">

                                    <legend className="float-none w-auto px-2 h5">
                                        Answer Options
                                    </legend>

                                    <div className="row g-3">

                                        {/* Answer A. */}
                                        <div className="col-12">
                                            <label
                                                htmlFor="answerA"
                                                className="form-label"
                                            >
                                                Answer A <span className="text-danger">*</span>
                                            </label>

                                            <input
                                                id="answerA"
                                                name="answerA"
                                                type="text"
                                                className="form-control"
                                                value={formData.answerA}
                                                onChange={handleChange}
                                                maxLength={300}
                                                required
                                            />
                                        </div>

                                        {/* Answer B. */}
                                        <div className="col-12">
                                            <label
                                                htmlFor="answerB"
                                                className="form-label"
                                            >
                                                Answer B <span className="text-danger">*</span>
                                            </label>

                                            <input
                                                id="answerB"
                                                name="answerB"
                                                type="text"
                                                className="form-control"
                                                value={formData.answerB}
                                                onChange={handleChange}
                                                maxLength={300}
                                                required
                                            />
                                        </div>

                                        {/* Answer C. */}
                                        <div className="col-12">
                                            <label
                                                htmlFor="answerC"
                                                className="form-label"
                                            >
                                                Answer C <span className="text-danger">*</span>
                                            </label>

                                            <input
                                                id="answerC"
                                                name="answerC"
                                                type="text"
                                                className="form-control"
                                                value={formData.answerC}
                                                onChange={handleChange}
                                                maxLength={300}
                                                required
                                            />
                                        </div>

                                        {/* Answer D. */}
                                        <div className="col-12">
                                            <label
                                                htmlFor="answerD"
                                                className="form-label"
                                            >
                                                Answer D <span className="text-danger">*</span>
                                            </label>

                                            <input
                                                id="answerD"
                                                name="answerD"
                                                type="text"
                                                className="form-control"
                                                value={formData.answerD}
                                                onChange={handleChange}
                                                maxLength={300}
                                                required
                                            />
                                        </div>

                                    </div>
                                </fieldset>
                            </div>

                            {/* Select which answer is correct. */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="correctAnswer"
                                    className="form-label"
                                >
                                    Correct Answer <span className="text-danger">*</span>
                                </label>

                                <select
                                    id="correctAnswer"
                                    name="correctAnswer"
                                    className="form-select"
                                    value={formData.correctAnswer}
                                    onChange={handleChange}
                                    required
                                >
                                    {/* Values match the backend enum. */}
                                    <option value={0}>A</option>
                                    <option value={1}>B</option>
                                    <option value={2}>C</option>
                                    <option value={3}>D</option>
                                </select>
                            </div>

                        </div>

                        {/* Form actions. */}
                        <div className="d-flex flex-wrap gap-2 mt-4">

                            {/* Submit the form. */}
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : isEditing
                                        ? "Save Changes"
                                        : "Create Question"}
                            </button>

                            {/* Cancel and return to the question list. */}
                            <Link
                                to={`/games/${gameId}/questions`}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </Link>

                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default QuestionForm;
