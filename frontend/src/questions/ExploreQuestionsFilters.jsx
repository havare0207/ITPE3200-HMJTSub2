
// ExploreQuestionFilters.jsx

// Available question categories.
// These should match the categories stored in the backend.
const categories = [
    "Java",
    "JavaScript",
    "HTML/CSS",
    "Python",
    "Game History",
    "C#"
];

// Displays the search and filtering controls on the Explore Questions page.
function ExploreQuestionFilters({
    filters,
    setFilters,
    gameOptions,
    onSearch,
    onClear
}) {

    // Updates the filter state when the user changes an input.
    function handleChange(event) {
        const { name, value } = event.target;

        // Update only the filter that has changed.
        setFilters(previous => ({
            ...previous,
            [name]: value
        }));
    }

    return (
        // Search section, styled to match Subapp 1.
        <section aria-labelledby="question-search-heading">

            <form
                onSubmit={onSearch}
                role="search"
                className="question-search card border-0 shadow-sm p-3 p-md-4 mb-4"
            >

                {/* Heading and explanation for the search controls. */}
                <div className="mb-3">

                    <h2
                        id="question-search-heading"
                        className="h5 fw-bold mb-1"
                    >
                        <i
                            className="bi bi-search me-2"
                            aria-hidden="true"
                        />
                        Find your next question
                    </h2>

                    <p
                        id="question-search-help"
                        className="text-muted small mb-0"
                    >
                        Search by keyword or narrow down the results
                        using category, difficulty or game.
                    </p>

                </div>

                <div className="row g-3">

                    {/* Keyword search input. */}
                    <div className="col-12">

                        <label
                            htmlFor="searchString"
                            className="form-label fw-semibold"
                        >
                            Search questions
                        </label>

                        <div className="input-group">

                            {/* Decorative search icon. */}
                            <span
                                className="input-group-text bg-body"
                                aria-hidden="true"
                            >
                                <i className="bi bi-search" />
                            </span>

                            <input
                                id="searchString"
                                name="searchString"
                                type="text"
                                className="form-control"
                                value={filters.searchString}
                                onChange={handleChange}
                                placeholder="e.g. What is a closing tag?..."
                                aria-describedby="question-search-help"
                            />

                        </div>

                    </div>

                    {/* Category filter. */}
                    <div className="col-12 col-md-6">

                        <label
                            htmlFor="category"
                            className="form-label"
                        >
                            Category
                        </label>

                        <select
                            id="category"
                            name="category"
                            className="form-select"
                            value={filters.category}
                            onChange={handleChange}
                            aria-describedby="question-search-help"
                        >
                            <option value="">All categories</option>

                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}

                        </select>

                    </div>

                    {/* Difficulty filter. */}
                    <div className="col-12 col-md-6">

                        <label
                            htmlFor="difficulty"
                            className="form-label"
                        >
                            Difficulty
                        </label>

                        <select
                            id="difficulty"
                            name="difficulty"
                            className="form-select"
                            value={filters.difficulty}
                            onChange={handleChange}
                            aria-describedby="question-search-help"
                        >
                            <option value="">All difficulties</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>

                    </div>

                    {/* Game filter. */}
                    <div className="col-12 col-md-6">

                        <label
                            htmlFor="gameId"
                            className="form-label"
                        >
                            Game
                        </label>

                        <select
                            id="gameId"
                            name="gameId"
                            className="form-select"
                            value={filters.gameId}
                            onChange={handleChange}
                            aria-describedby="question-search-help"
                        >
                            <option value="">All games</option>

                            {gameOptions.map(game => (
                                <option
                                    key={game.gameId}
                                    value={game.gameId}
                                >
                                    {game.gameName}
                                </option>
                            ))}

                        </select>

                    </div>

                    {/* Search and clear-filter buttons. */}
                    <div className="col-12 d-flex flex-wrap gap-2 mt-4">

                        <button
                            type="submit"
                            className="btn btn-primary px-4"
                        >
                            <i
                                className="bi bi-search me-1"
                                aria-hidden="true"
                            />
                            Search questions
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline-secondary px-4"
                            onClick={onClear}
                        >
                            <i
                                className="bi bi-arrow-counterclockwise me-1"
                                aria-hidden="true"
                            />
                            Clear filters
                        </button>

                    </div>

                </div>

            </form>

        </section>
    );
}

export default ExploreQuestionFilters;