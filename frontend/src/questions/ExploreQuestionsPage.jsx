// ExploreQuestionsPage.jsx
import { useEffect, useState } from "react";

// Import the API service used to retrieve questions.
import { getQuestions } from "../services/questionApi";

// Import the search and filtering component.
import ExploreQuestionFilters from "./ExploreQuestionsFilters.jsx";

function ExploreQuestionsPage() {

    // Stores the questions retrieved from the backend.
    const [questions, setQuestions] = useState([]);

    // Stores the values currently selected in the filter inputs.
    const [filters, setFilters] = useState({
        searchString: "",
        category: "",
        difficulty: "",
        gameId: ""
    });

    // Stores the filters currently applied to the API request.
    const [appliedFilters, setAppliedFilters] = useState({
        searchString: "",
        category: "",
        difficulty: "",
        gameId: ""
    });

    // Tracks whether questions are currently being loaded.
    const [loading, setLoading] = useState(true);

    // Stores an error message if the API request fails.
    const [error, setError] = useState("");

    // Sets the browser tab title.
    useEffect(() => {
        document.title = "Explore Questions";
    }, []);

    // Retrieves questions whenever the applied filters change.
    useEffect(() => {

        // This function loads the questions from the API.
        async function loadQuestions() {

            try {
                setLoading(true);
                setError("");

                // Send the selected filters to the backend.
                const data = await getQuestions(appliedFilters);

                // Store the returned questions.
                setQuestions(data);

            } catch (err) {

                // Display an error if the API request fails.
                setError(err.message || "Unable to load questions.");

            } finally {

                // Stop displaying the loading message.
                setLoading(false);
            }
        }

        loadQuestions();

    }, [appliedFilters]);

    // Applies the selected filters when the form is submitted.
    function handleSearch(event) {
        event.preventDefault();

        // Copy the current filter values into the applied filters.
        setAppliedFilters({ ...filters });
    }

    // Clears all filters and retrieves the questions again.
    function handleClear() {

        const emptyFilters = {
            searchString: "",
            category: "",
            difficulty: "",
            gameId: ""
        };

        // Reset the filter inputs.
        setFilters(emptyFilters);

        // Request all questions without filters.
        setAppliedFilters(emptyFilters);
    }

    // Creates a list of unique games from the retrieved questions.
    const gameOptions = [
        ...new Map(
            questions.map(question => [
                question.gameId,
                {
                    gameId: question.gameId,
                    gameName: question.gameName
                }
            ])
        ).values()
    ].filter(game => game.gameName);

    // Converts the numeric difficulty value from the API into a readable name.
    function getDifficultyName(difficulty) {

        // These values correspond to the backend Difficulty enum.
        return ["Easy", "Medium", "Hard"][difficulty] ?? difficulty;
    }

    // Converts the numeric correct-answer value into its corresponding letter.
    function getAnswerLetter(answer) {

        // These values correspond to the backend AnswerOption enum.
        return ["A", "B", "C", "D"][answer] ?? answer;
    }

    return (
        <div className="explore-questions">

            {/* =====================================
                Page heading and introduction
                ===================================== */}

            <div className="mb-4">

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">

                    {/* Main page heading. */}
                    <h1 className="mb-0">
                        Explore Questions
                    </h1>


                </div>

                {/* Welcome banner matching Subapp 1. */}
                <section
                    className="welcome-banner p-4 p-md-5 mb-4 rounded-3 text-white"
                    aria-labelledby="questions-welcome-heading"
                >

                    <h2 id="questions-welcome-heading">
                        Welcome, Curious Mind!

                        <span aria-hidden="true"> 🧠</span>
                    </h2>

                    <p className="mb-3">
                        Explore the questions in your custom games,
                        discover different topics, and challenge your knowledge.
                    </p>

                    <p className="mb-0">
                        Search through questions from the games you have created
                        and find exactly what you are looking for using the
                        search and filtering options below.
                        Let the quiz adventure begin!
                    </p>

                </section>

            </div>

            {/* =====================================
                Search and filtering
                ===================================== */}

            {/* Display the separate search and filtering component. */}
            <ExploreQuestionFilters
                filters={filters}
                setFilters={setFilters}
                gameOptions={gameOptions}
                onSearch={handleSearch}
                onClear={handleClear}
            />

            {/* =====================================
                Loading and error messages
                ===================================== */}

            {/* Display a loading message while retrieving questions. */}
            {loading && (
                <div className="alert alert-info" role="status">
                    Loading questions...
                </div>
            )}

            {/* Display an error if the API request fails. */}
            {!loading && error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* =====================================
                Search results
                ===================================== */}

            {!loading && !error && (

                <section aria-labelledby="question-results-heading">

                    {/* Results heading and question count. */}
                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h2
                            id="question-results-heading"
                            className="h5 mb-0"
                        >
                            Questions
                        </h2>

                        {/* Makes the result count available to screen readers. */}
                        <span
                            className="badge bg-secondary"
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {questions.length} question(s)
                        </span>

                    </div>

                    {/* Hidden description for screen-reader users. */}
                    <p className="visually-hidden">
                        {questions.length} question results are currently displayed.
                    </p>

                    {/* =====================================
                        Empty search result
                        ===================================== */}

                    {questions.length === 0 ? (

                        <div className="text-center py-4">

                            {/* Decorative search icon. */}
                            <i
                                className="bi bi-search fs-3 d-block mb-2 text-muted"
                                aria-hidden="true"
                            />

                            <strong>
                                No questions found
                            </strong>

                            <p className="text-muted mb-2">
                                Try another keyword or change your filters.
                            </p>

                            {/* Clears the filters and displays all questions again. */}
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={handleClear}
                            >
                                Show all questions
                            </button>

                        </div>

                    ) : (

                        /* =====================================
                           Questions table
                           ===================================== */

                        // Makes the table horizontally scrollable on smaller screens.
                        <div className="table-responsive">

                            <table className="table table-bordered table-striped table-hover align-middle">

                                {/* Accessible table description. */}
                                <caption className="visually-hidden">
                                    Search results showing questions from the current
                                    user's custom games, including category,
                                    difficulty, correct answer and game name.
                                </caption>

                                <thead className="table-light">

                                    <tr>
                                        <th scope="col">Question</th>
                                        <th scope="col">Category</th>
                                        <th scope="col">Difficulty</th>
                                        <th scope="col">Correct Answer</th>
                                        <th scope="col">Game Name</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {/* Display each question matching the filters. */}
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
                                                {getDifficultyName(question.difficulty)}
                                            </td>

                                            <td>
                                                {getAnswerLetter(question.correctAnswer)}
                                            </td>

                                            <td>
                                                {question.gameName}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            )}

        </div>
    );
}

export default ExploreQuestionsPage;
