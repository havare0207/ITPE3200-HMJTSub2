
import { useEffect, useState } from "react";

// Import the function that retrieves questions from the backend API.
import { getQuestions } from "../services/questionApi";

// Import the filter component.
import ExploreQuestionFilters from "./ExploreQuestionFilters";

// Import shared styling.
import "../shared/Layout.css";

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

    // Stores the filters that should actually be applied to the API request.
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

    // Retrieves questions whenever the applied filters change.
    useEffect(() => {

        // Defines an asynchronous function for loading questions.
        async function loadQuestions() {
            try {
                setLoading(true);
                setError("");

                // Request questions from the backend using the selected filters.
                const data = await getQuestions(appliedFilters);

                // Save the retrieved questions in state.
                setQuestions(data);

            } catch (err) {

                // Display an error if the API request fails.
                setError(err.message);

            } finally {

                // Stop displaying the loading message.
                setLoading(false);
            }
        }

        loadQuestions();

    }, [appliedFilters]);

    // Applies the selected filters when the search form is submitted.
    function handleSearch(event) {
        event.preventDefault();

        // Copy the selected filters into the applied filters.
        setAppliedFilters({ ...filters });
    }

    // Clears all filters and retrieves all questions again.
    function handleClear() {

        const emptyFilters = {
            searchString: "",
            category: "",
            difficulty: "",
            gameId: ""
        };

        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
    }

    // Creates a list of unique games from the retrieved questions.
    // This list is used to populate the Game filter dropdown.
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
        return ["Easy", "Medium", "Hard"][difficulty] ?? difficulty;
    }

    // Converts the numeric correct answer value into its corresponding letter.
    function getAnswerLetter(answer) {
        return ["A", "B", "C", "D"][answer] ?? answer;
    }

    return (
        <main className="explore-questions">

            {/* Page heading. */}
            <h1>Explore Questions</h1>

            {/* Welcome section introducing the Explore Questions page. */}
            <section className="explore-welcome">
                <h2>Welcome, Curious Mind!</h2>

                <p>
                    Explore questions, discover different categories
                    and test your knowledge.
                </p>
            </section>

            {/* Display the question filters. */}
            <ExploreQuestionFilters
                filters={filters}
                setFilters={setFilters}
                gameOptions={gameOptions}
                onSearch={handleSearch}
                onClear={handleClear}
            />

            {/* Display a loading message while retrieving questions. */}
            {loading && (
                <p>Loading questions...</p>
            )}

            {/* Display an error if the API request fails. */}
            {error && (
                <p role="alert">{error}</p>
            )}

            {/* Display the question results after loading is complete. */}
            {!loading && !error && (
                <section className="explore-results">

                    {/* Display how many questions were found. */}
                    <p>
                        Showing {questions.length} question(s)
                    </p>

                    {/* Display a message if there are no matching questions. */}
                    {questions.length === 0 ? (

                        <div className="empty-state">
                            <h2>No questions found</h2>

                            <p>
                                Try changing your filters to find questions.
                            </p>

                            <button onClick={handleClear}>
                                Show all questions
                            </button>
                        </div>

                    ) : (

                        // Display the questions in a responsive table.
                        <div className="table-responsive">

                            <table>
                                <caption>Available questions</caption>

                                <thead>
                                    <tr>
                                        <th scope="col">Question</th>
                                        <th scope="col">Category</th>
                                        <th scope="col">Difficulty</th>
                                        <th scope="col">Correct Answer</th>
                                        <th scope="col">Game Name</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {/* Create one table row for each question. */}
                                    {questions.map(question => (
                                        <tr key={question.questionId}>

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

        </main>
    );
}

export default ExploreQuestionsPage;
