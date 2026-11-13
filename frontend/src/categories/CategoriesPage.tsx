function CategoriesPage() {
    return (
        <div className="categories-page">

            {/* =====================================
                Page introduction
                ===================================== */}

            <section
                className="categories-intro mb-5"
                aria-labelledby="categories-page-heading"
            >
                <p className="categories-eyebrow">
                    Learn Before You Play
                </p>

                <h1
                    id="categories-page-heading"
                    className="categories-title"
                >
                    Code Pursuit Categories
                </h1>

                <p className="categories-intro-text">
                    Explore the six categories used in Code Pursuit.
                    Use the resources below to practise programming
                    concepts or learn more about the history of video games.
                </p>
            </section>


            {/* =====================================
                Category cards
                ===================================== */}

            <section
                className="mb-5"
                aria-labelledby="category-resources-heading"
            >
                <h2
                    id="category-resources-heading"
                    className="visually-hidden"
                >
                    Category learning resources
                </h2>

                <div className="row g-4">

                    {/* Java */}
                    <div className="col-md-6 col-xl-4">
                        <article className="category-resource-card category-java h-100">

                            <div
                                className="category-resource-icon"
                                aria-hidden="true"
                            >
                                <i className="bi bi-cup-hot-fill" />
                            </div>

                            <p className="category-label">
                                Java
                            </p>

                            <h2 className="category-resource-title">
                                Java
                            </h2>

                            <p>
                                Learn Java syntax, classes, objects,
                                methods and object-oriented programming.
                            </p>

                            <div className="category-resource-links">

                                <a
                                    href="https://www.w3schools.com/java/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn category-link-primary"
                                >
                                    W3Schools
                                    <i
                                        className="bi bi-box-arrow-up-right ms-2"
                                        aria-hidden="true"
                                    />
                                </a>

                                <a
                                    href="https://docs.oracle.com/en/java/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn category-link-secondary"
                                >
                                    Official Java
                                    <i
                                        className="bi bi-box-arrow-up-right ms-2"
                                        aria-hidden="true"
                                    />
                                </a>

                            </div>

                        </article>
                    </div>


                    {/* JavaScript */}
                    <div className="col-md-6 col-xl-4">
                        <article className="category-resource-card category-javascript h-100">

                            <div
                                className="category-resource-icon"
                                aria-hidden="true"
                            >
                                <i className="bi bi-filetype-js" />

                            </div>

                            <p className="category-label">
                                JavaScript
                            </p>

                            <h2 className="category-resource-title">
                                JavaScript
                            </h2>

                            <p>
                                Practise variables, functions, objects,
                                conditions and browser scripting.
                            </p>

                            <div className="category-resource-links">

                                <a
                                    href="https://www.w3schools.com/js/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn category-link-primary"
                                >
                                    W3Schools
                                    <i
                                        className="bi bi-box-arrow-up-right ms-2"
                                        aria-hidden="true"
                                    />
                                </a>

                                <a
                                    href="https://tc39.es/ecma262/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn category-link-secondary"
                                >
                                    ECMAScript Standard
                                    <i
                                        className="bi bi-box-arrow-up-right ms-2"
                                        aria-hidden="true"
                                    />
                                </a>

                            </div>

                        </article>
                    </div>


                    {/* HTML / CSS */}
                    <div className="col-md-6 col-xl-4">
                        <article className="category-resource-card category-html h-100">

                            <div
                                className="category-resource-icon"
                                aria-hidden="true"
                            >
                                <i className="bi bi-code-slash" />
                            </div>

                            <p className="category-label">
                                HTML / CSS
                            </p>

                            <h2 className="category-resource-title">
                                HTML/CSS
                            </h2>

                            <p>
                                Learn how web pages are structured with
                                HTML and styled using CSS.
                            </p>

                            <div className="category-resource-links category-resource-grid">

                                <a
                                    href="https://www.w3schools.com/html/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn category-link-primary"
                                >
                                    HTML W3Schools
                                </a>

                                <a
                                    href="https://www.w3schools.com/css/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn category-link-primary"
                                >
                                    CSS W3Schools
                                </a>

                                <a
                                    href="https://html.spec.whatwg.org/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn category-link-secondary"
                                >
                                    HTML Standard
                                </a>

                                <a
                                    href="https://www.w3.org/Style/CSS/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn category-link-secondary"
                                >
                                    CSS Standard
                                </a>

                            </div>

                        </article>
                    </div>


                    {/* Python */}
                    <div className="col-md-6 col-xl-4">
                        <article className="category-resource-card category-python h-100">

                            <div
                                className="category-resource-icon"
                                aria-hidden="true"
                            >
                                <i className="bi bi-terminal-fill" />
                            </div>

                            <p className="category-label">
                                Python
                            </p>

                            <h2 className="category-resource-title">
                                Python
                            </h2>

                            <p>
                                Explore Python syntax, loops, functions,
                                collections and programming fundamentals.
                            </p>

                            <div className="category-resource-links">

                                <a
                                    href="https://www.w3schools.com/python/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn category-link-primary"
                                >
                                    W3Schools
                                    <i
                                        className="bi bi-box-arrow-up-right ms-2"
                                        aria-hidden="true"
                                    />
                                </a>

                                <a
                                    href="https://www.python.org/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn category-link-secondary"
                                >
                                    Python.org
                                    <i
                                        className="bi bi-box-arrow-up-right ms-2"
                                        aria-hidden="true"
                                    />
                                </a>

                            </div>

                        </article>
                    </div>


                    {/* Game History */}
                    <div className="col-md-6 col-xl-4">
                        <article className="category-resource-card category-game-history h-100">

                            <div
                                className="category-resource-icon"
                                aria-hidden="true"
                            >
                                <i className="bi bi-controller" />
                            </div>

                            <p className="category-label">
                                Game History
                            </p>

                            <h2 className="category-resource-title">
                                Game History
                            </h2>

                            <p>
                                Explore some important milestones in the
                                development of video games and consoles.
                            </p>

                            <div className="category-resource-links">

                                <a
                                    href="#game-history-timeline"
                                    className="btn category-link-primary"
                                >
                                    Short Timeline
                                    <i
                                        className="bi bi-arrow-down ms-2"
                                        aria-hidden="true"
                                    />
                                </a>

                            </div>

                        </article>
                    </div>


                    {/* C# */}
                    <div className="col-md-6 col-xl-4">
                        <article className="category-resource-card category-csharp h-100">

                            <div
                                className="category-resource-icon"
                                aria-hidden="true"
                            >
                                <i className="bi bi-braces" />
                            </div>

                            <p className="category-label">
                                C#
                            </p>

                            <h2 className="category-resource-title">
                                C#
                            </h2>

                            <p>
                                Learn C# syntax, classes, methods,
                                collections and .NET fundamentals.
                            </p>

                            <div className="category-resource-links">

                                <a
                                    href="https://www.w3schools.com/cs/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn category-link-primary"
                                >
                                    W3Schools
                                    <i
                                        className="bi bi-box-arrow-up-right ms-2"
                                        aria-hidden="true"
                                    />
                                </a>

                                <a
                                    href="https://learn.microsoft.com/en-us/dotnet/csharp/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn category-link-secondary"
                                >
                                    Microsoft C# Docs
                                    <i
                                        className="bi bi-box-arrow-up-right ms-2"
                                        aria-hidden="true"
                                    />
                                </a>

                            </div>

                        </article>
                    </div>

                </div>
            </section>


            {/* =====================================
                Game History timeline
                ===================================== */}

            <section
                id="game-history-timeline"
                className="game-history-section mb-5"
                aria-labelledby="game-history-heading"
            >
                <p className="categories-eyebrow">
                    Game History
                </p>

                <h2
                    id="game-history-heading"
                    className="game-history-title"
                >
                    A Short Timeline of Video Games
                </h2>

                <p className="game-history-intro">
                    Some important moments from early computer games
                    to the modern gaming industry.
                </p>

                {/* Ordered list because the timeline is chronological. */}
                <ol className="game-history-timeline">

                    <li>
                        <span className="timeline-year">
                            1958
                        </span>

                        <div className="timeline-card">
                            <h3>Tennis for Two</h3>

                            <p>
                                One of the earliest interactive electronic
                                games is demonstrated using an oscilloscope.
                            </p>
                        </div>
                    </li>

                    <li>
                        <span className="timeline-year">
                            1962
                        </span>

                        <div className="timeline-card">
                            <h3>Spacewar!</h3>

                            <p>
                                Spacewar! becomes one of the earliest
                                influential computer games.
                            </p>
                        </div>
                    </li>

                    <li>
                        <span className="timeline-year">
                            1972
                        </span>

                        <div className="timeline-card">
                            <h3>Pong</h3>

                            <p>
                                Atari releases Pong, helping arcade
                                video games reach a much wider audience.
                            </p>
                        </div>
                    </li>

                    <li>
                        <span className="timeline-year">
                            1985
                        </span>

                        <div className="timeline-card">
                            <h3>Nintendo Entertainment System</h3>

                            <p>
                                The NES launches in North America and
                                helps revitalise the home console market.
                            </p>
                        </div>
                    </li>

                    <li>
                        <span className="timeline-year">
                            1993
                        </span>

                        <div className="timeline-card">
                            <h3>Doom</h3>

                            <p>
                                Doom becomes a landmark title for
                                first-person shooters and PC gaming.
                            </p>
                        </div>
                    </li>

                    <li>
                        <span className="timeline-year">
                            1994
                        </span>

                        <div className="timeline-card">
                            <h3>PlayStation</h3>

                            <p>
                                Sony launches the original PlayStation
                                in Japan.
                            </p>
                        </div>
                    </li>

                    <li>
                        <span className="timeline-year">
                            2004
                        </span>

                        <div className="timeline-card">
                            <h3>World of Warcraft</h3>

                            <p>
                                Online multiplayer gaming grows further
                                with the release of World of Warcraft.
                            </p>
                        </div>
                    </li>

                    <li>
                        <span className="timeline-year">
                            2011
                        </span>

                        <div className="timeline-card">
                            <h3>Minecraft</h3>

                            <p>
                                Minecraft receives its full release and
                                becomes one of the most successful games
                                ever made.
                            </p>
                        </div>
                    </li>

                    <li>
                        <span className="timeline-year">
                            Today
                        </span>

                        <div className="timeline-card">
                            <h3>Modern Gaming</h3>

                            <p>
                                Gaming now spans PCs, consoles, mobile
                                devices, virtual reality, cloud services
                                and competitive esports.
                            </p>
                        </div>
                    </li>

                </ol>
            </section>


            {/* =====================================
                External learning resource
                ===================================== */}

            <section
                className="categories-learning-resource mb-4"
                aria-labelledby="external-resource-heading"
            >
                <div>
                    <p className="categories-resource-eyebrow">
                        External Learning Resource
                    </p>

                    <h2 id="external-resource-heading">
                        W3Schools
                    </h2>

                    <p>
                        W3Schools provides tutorials, examples and
                        interactive exercises for many of the programming
                        languages used in Code Pursuit.
                    </p>
                </div>

                <a
                    href="https://www.w3schools.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="btn categories-resource-button"
                >
                    Visit W3Schools

                    <i
                        className="bi bi-box-arrow-up-right ms-2"
                        aria-hidden="true"
                    />
                </a>
            </section>

        </div>
    );
}

export default CategoriesPage;