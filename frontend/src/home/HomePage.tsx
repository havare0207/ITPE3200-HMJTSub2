import { Link } from "react-router-dom";

import categoriesImage from "../assets/categories.png";

function HomePage() {
    return (
        <div className="home-page">

            {/* =====================================
                Welcome / Hero section
                ===================================== */}

            <section
                className="home-hero mb-5"
                aria-labelledby="home-heading"
            >
                <div className="row align-items-center g-4">

                    {/* Main introduction and page actions. */}
                    <div className="col-lg-7">

                        <h1
                            id="home-heading"
                            className="home-hero-title"
                        >
                            Welcome to Code Pursuit!
                        </h1>

                        <p className="home-hero-text">
                            Test your programming knowledge,
                            challenge your friends, and collect
                            category wedges on your way to victory.
                        </p>

                        <div className="d-flex flex-wrap gap-3">

                          {/* Opens the game setup page. */}
                          <Link
                              to="/play"
                              className="btn btn-primary btn-lg home-hero-primary"
                          >
                              <i
                                  className="bi bi-controller me-2"
                                  aria-hidden="true"
                              />
                              Play Game
                          </Link>

                          {/* Opens the question exploration page. */}
                          <Link
                              to="/explore-questions"
                              className="btn btn-outline-primary btn-lg home-hero-secondary"
                          >
                              <i
                                  className="bi bi-search me-2"
                                  aria-hidden="true"
                              />
                              Explore Questions
                          </Link>

                          {/* Opens the user's custom games. */}
                          <Link
                              to="/games"
                              className="btn btn-outline-primary btn-lg home-hero-secondary"
                          >
                              <i
                                  className="bi bi-grid-3x3-gap-fill me-2"
                                  aria-hidden="true"
                              />
                              My Games
                          </Link>

                          {/* Opens the user's notes. */}
                          <Link
                              to="/notes"
                              className="btn btn-outline-primary btn-lg home-hero-secondary"
                          >
                              <i
                                  className="bi bi-journal-text me-2"
                                  aria-hidden="true"
                              />
                              Notes
                          </Link>

                          {/* Opens the category information page. */}
                          <Link
                              to="/categories"
                              className="btn btn-outline-primary btn-lg home-hero-secondary"
                          >
                              <i
                                  className="bi bi-bookmarks-fill me-2"
                                  aria-hidden="true"
                              />
                              Categories
                          </Link>

                      </div>

                    </div>


                    <div className="text-center mb-4">
                      <img
                          src={categoriesImage}
                          className="home-categories-image img-fluid"
                          alt="The six Code Pursuit question categories: Java, JavaScript, HTML and CSS, Python, Game History and C#"
                      />

                      {/* Quick links to information further down the Home page. */}
                      <div className="d-flex flex-wrap justify-content-center gap-3 mt-3">

                          <a
                              href="#what-is-code-pursuit"
                              className="home-jump-link"
                          >
                              <i
                                  className="bi bi-question-circle me-2"
                                  aria-hidden="true"
                              />
                              What is Code Pursuit?
                          </a>

                          <a
                              href="#how-to-play"
                              className="home-jump-link"
                          >
                              <i
                                  className="bi bi-arrow-down-circle me-2"
                                  aria-hidden="true"
                              />
                              How to Play
                          </a>

                      </div>
                  </div>

                </div>
            </section>

            {/* =====================================
                Game overview statistics
                ===================================== */}

            <section
                className="home-stats mb-5"
                aria-label="Game overview"
            >
                <div className="row g-3">

                    <div className="col-12 col-sm-4">
                        <div className="home-stat-card">
                            <strong className="home-stat-number">
                                2–6
                            </strong>

                            <span className="home-stat-label">
                                Players
                            </span>
                        </div>
                    </div>

                    <div className="col-12 col-sm-4">
                        <div className="home-stat-card">
                            <strong className="home-stat-number">
                                6
                            </strong>

                            <span className="home-stat-label">
                                Categories
                            </span>
                        </div>
                    </div>

                    <div className="col-12 col-sm-4">
                        <div className="home-stat-card">
                            <strong className="home-stat-number">
                                3
                            </strong>

                            <span className="home-stat-label">
                                Difficulties
                            </span>
                        </div>
                    </div>

                </div>
            </section>


            {/* =====================================
                About Code Pursuit
                ===================================== */}

            <section
                id="what-is-code-pursuit"
                className="home-section-card mb-5"
                aria-labelledby="about-heading"
            >
                <div className="home-section-icon" aria-hidden="true">
                    <i className="bi bi-question-circle-fill" />
                </div>

                <div>
                    <h2
                        id="about-heading"
                        className="mb-3"
                    >
                        What is Code Pursuit?
                    </h2>

                    <p>
                        Code Pursuit is a programming trivia game
                        inspired by classic category-based quiz games.
                        Players answer questions from different
                        programming and game-related categories.
                    </p>

                    <p className="mb-0">
                        Answer questions correctly to collect wedges
                        from every category. The first player to
                        complete all categories and answer the final
                        question correctly wins the game.
                    </p>
                </div>
            </section>


            {/* =====================================
                How to Play
                ===================================== */}

            <section
                id="how-to-play"
                className="home-section-card mb-5"
                aria-labelledby="how-to-play-heading"
            >
                <h2
                    id="how-to-play-heading"
                    className="mb-4"
                >
                    How to Play
                </h2>

                {/*
                    An ordered list is used because these instructions
                    describe steps that are performed in sequence.
                */}
                <ol className="home-steps">

                    <li>
                        <div className="home-step-icon" aria-hidden="true">
                            <i className="bi bi-people-fill" />
                        </div>

                        <div>
                            <strong>Set up the game.</strong>
                            <span>
                                {" "}Choose the players and select a difficulty.
                            </span>
                        </div>
                    </li>

                    <li>
                        <div className="home-step-icon" aria-hidden="true">
                            <i className="bi bi-dice-6-fill" />
                        </div>

                        <div>
                            <strong>Roll the dice.</strong>
                            <span>
                                {" "}The dice determines which category
                                you will answer a question from.
                            </span>
                        </div>
                    </li>

                    <li>
                        <div className="home-step-icon" aria-hidden="true">
                            <i className="bi bi-patch-question-fill" />
                        </div>

                        <div>
                            <strong>Answer the question.</strong>
                            <span>
                                {" "}Select the answer you believe is correct.
                            </span>
                        </div>
                    </li>

                    <li>
                        <div className="home-step-icon" aria-hidden="true">
                            <i className="bi bi-award-fill" />
                        </div>

                        <div>
                            <strong>Collect wedges.</strong>
                            <span>
                                {" "}Correct answers can earn category
                                wedges for your player.
                            </span>
                        </div>
                    </li>

                    <li>
                        <div className="home-step-icon" aria-hidden="true">
                            <i className="bi bi-trophy-fill" />
                        </div>

                        <div>
                            <strong>Complete the challenge.</strong>
                            <span>
                                {" "}After collecting all six category wedges, move to the center
                                and answer a final question from one of the six categories,
                                chosen by the other players. If you answer incorrectly, you must
                                leave the center and reach it again, or roll a 6 to move back into
                                the center for another final question on your turn.
                            </span>
                        </div>
                    </li>

                </ol>
            </section>


            {/* =====================================
                Question Categories
                ===================================== */}

            <section
                className="mb-5"
                aria-labelledby="categories-heading"
            >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

                    <h2
                        id="categories-heading"
                        className="mb-0"
                    >
                        Question Categories
                    </h2>

                    <Link
                        to="/categories"
                        className="btn btn-outline-primary"
                    >
                        View Categories
                    </Link>

                </div>


                {/* Category cards. */}
                <div className="row g-4">

                    {/* Java */}
                    <div className="col-sm-6 col-lg-4">
                        <article className="home-category-card category-java h-100">

                            <div
                                className="home-category-icon"
                                aria-hidden="true"
                            >
                                <i className="bi bi-cup-hot-fill" />
                            </div>

                            <h3>Java</h3>

                            <p>
                                Questions about Java syntax,
                                concepts and programming.
                            </p>

                        </article>
                    </div>


                    {/* JavaScript */}
                    <div className="col-sm-6 col-lg-4">
                        <article className="home-category-card category-javascript h-100">

                            <div
                                className="home-category-icon"
                                aria-hidden="true"
                            >
                                <i className="bi bi-filetype-js" />
                            </div>

                            <h3>JavaScript</h3>

                            <p>
                                Test your knowledge of JavaScript
                                and web programming.
                            </p>

                        </article>
                    </div>


                    {/* HTML / CSS */}
                    <div className="col-sm-6 col-lg-4">
                        <article className="home-category-card category-html h-100">

                            <div
                                className="home-category-icon"
                                aria-hidden="true"
                            >
                                <i className="bi bi-code-slash" />
                            </div>

                            <h3>HTML / CSS</h3>

                            <p>
                                Questions covering web structure,
                                styling and responsive design.
                            </p>

                        </article>
                    </div>


                    {/* Python */}
                    <div className="col-sm-6 col-lg-4">
                        <article className="home-category-card category-python h-100">

                            <div
                                className="home-category-icon"
                                aria-hidden="true"
                            >
                                <i className="bi bi-terminal-fill" />
                            </div>

                            <h3>Python</h3>

                            <p>
                                Explore Python syntax,
                                programming concepts and logic.
                            </p>

                        </article>
                    </div>


                    {/* Game History */}
                    <div className="col-sm-6 col-lg-4">
                        <article className="home-category-card category-game-history h-100">

                            <div
                                className="home-category-icon"
                                aria-hidden="true"
                            >
                                <i className="bi bi-controller" />
                            </div>

                            <h3>Game History</h3>

                            <p>
                                Discover questions about video games,
                                gaming history and technology.
                            </p>

                        </article>
                    </div>


                    {/* C# */}
                    <div className="col-sm-6 col-lg-4">
                        <article className="home-category-card category-csharp h-100">

                            <div
                                className="home-category-icon"
                                aria-hidden="true"
                            >
                                <i className="bi bi-braces" />
                            </div>

                            <h3>C#</h3>

                            <p>
                                Questions about C#, .NET
                                and object-oriented programming.
                            </p>

                        </article>
                    </div>

                </div>
            </section>


            {/* =====================================
                Final call to action
                ===================================== */}

            <section
                className="home-start-card mb-4"
                aria-labelledby="start-playing-heading"
            >
                <i
                    className="bi bi-play-circle-fill home-start-icon"
                    aria-hidden="true"
                />

                <h2
                    id="start-playing-heading"
                    className="mb-3"
                >
                    Ready to Start?
                </h2>

                <p className="mb-4">
                    Gather your players, choose a difficulty,
                    and see who knows the most about programming.
                </p>

                <Link
                    to="/play"
                    className="btn btn-primary btn-lg home-hero-primary"
                >
                    Start Playing
                </Link>
            </section>

        </div>
    );
}

export default HomePage;