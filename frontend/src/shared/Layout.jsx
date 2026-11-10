
import { Outlet, NavLink } from "react-router-dom";
import "./Layout.css";

// Shared layout used by all pages in the application.
function Layout() {
    return (
        <div className="app-layout">

            {/* Skip link for keyboard and screen-reader users. */}
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>

            {/* Header and primary navigation. */}
            <header>
                <nav
                    className="navbar navbar-expand-sm navbar-dark shadow-sm mb-4"
                    aria-label="Primary navigation"
                >
                    <div className="container">

                        {/* Application name and link to Home. */}
                        <NavLink
                            className="navbar-brand fw-bold"
                            to="/"
                        >
                            CodePursuit
                        </NavLink>

                        {/* Mobile navigation toggle. */}
                        <button
                            className="navbar-toggler"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#navbarSupportedContent"
                            aria-controls="navbarSupportedContent"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >
                            <span
                                className="navbar-toggler-icon"
                                aria-hidden="true"
                            />
                        </button>

                        {/* Navigation links. */}
                        <div
                            className="collapse navbar-collapse justify-content-between"
                            id="navbarSupportedContent"
                        >
                            <ul className="navbar-nav flex-grow-1">

                                <li className="nav-item">
                                    <NavLink
                                        to="/"
                                        end
                                        className="nav-link"
                                    >
                                        Home
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink
                                        to="/play"
                                        className="nav-link"
                                    >
                                        Play
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink
                                        to="/explore-questions"
                                        className="nav-link"
                                    >
                                        Explore Questions
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink
                                        to="/games"
                                        className="nav-link"
                                    >
                                        My Games
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink
                                        to="/notes"
                                        className="nav-link"
                                    >
                                        Notes
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink
                                        to="/categories"
                                        className="nav-link"
                                    >
                                        Categories
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink
                                        to="/privacy"
                                        className="nav-link"
                                    >
                                        Privacy
                                    </NavLink>
                                </li>

                            </ul>

                            {/* Authentication controls can be added here
                                when your teammate integrates authentication. */}

                        </div>
                    </div>
                </nav>
            </header>

            {/* Main page content.
                Outlet renders the page belonging to the current route. */}
            <div className="container">
                <main
                    id="main-content"
                    className="pb-3"
                    tabIndex="-1"
                >
                    <Outlet />
                </main>
            </div>

            {/* Application footer. */}
            <footer className="border-top footer text-muted">
                <div className="container">
                    <span>&copy; 2026 - CodePursuit - </span>

                    <NavLink to="/privacy">
                        Privacy
                    </NavLink>
                </div>
            </footer>

        </div>
    );
}

export default Layout;
