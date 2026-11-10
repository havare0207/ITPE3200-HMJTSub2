// Available question categories.
// These should match the categories used in the backend.
const categories = [
    "Java",
    "JavaScript",
    "HTML/CSS",
    "Python",
    "Game History",
    "C#"
];

// This component displays the filters used on the Explore Questions page.
function ExploreQuestionFilters({
    filters,
    setFilters,
    gameOptions,
    onSearch,
    onClear
}) {

    // Updates the relevant filter when the user changes an input.
    function handleChange(event) {
        const { name, value } = event.target;

        // Update only the filter that was changed.
        setFilters(previous => ({
            ...previous,
            [name]: value
        }));
    }

    return (
        <section className="explore-filters">

            <h2>Find Questions</h2>

            <p>
                Search for questions or filter them by
                category, difficulty and game.
            </p>

            {/* Form for searching and filtering questions. */}
            <form onSubmit={onSearch}>

                {/* Search questions using keywords. */}
                <div>
                    <label htmlFor="searchString">
                        Search questions
                    </label>

                    <input
                        id="searchString"
                        name="searchString"
                        type="text"
                        value={filters.searchString}
                        onChange={handleChange}
                        placeholder="Enter a keyword..."
                    />
                </div>

                {/* Filter questions by category. */}
                <div>
                    <label htmlFor="category">Category</label>

                    <select
                        id="category"
                        name="category"
                        value={filters.category}
                        onChange={handleChange}
                    >
                        <option value="">All categories</option>

                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filter questions by difficulty level. */}
                <div>
                    <label htmlFor="difficulty">Difficulty</label>

                    <select
                        id="difficulty"
                        name="difficulty"
                        value={filters.difficulty}
                        onChange={handleChange}
                    >
                        <option value="">All difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>

                {/* Filter questions by the game they belong to. */}
                <div>
                    <label htmlFor="gameId">Game</label>

                    <select
                        id="gameId"
                        name="gameId"
                        value={filters.gameId}
                        onChange={handleChange}
                    >
                        <option value="">All games</option>

                        {gameOptions.map(game => (
                            <option key={game.gameId} value={game.gameId}>
                                {game.gameName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Submit the selected filters. */}
                <button type="submit">
                    Search
                </button>

                {/* Reset all filters and show all questions again. */}
                <button type="button" onClick={onClear}>
                    Clear filters
                </button>

            </form>
        </section>
    );
}

export default ExploreQuestionFilters;
