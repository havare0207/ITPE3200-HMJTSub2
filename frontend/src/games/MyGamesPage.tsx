import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  getGames,
  createGame,
  updateGame,
  deleteGame
} from "./GamesService";

import type { Game } from "./GamesService";

function MyGamesPage() {
  const { token } = useAuth();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newGameName, setNewGameName] = useState("");
  const [editingGameId, setEditingGameId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadGames() {
    if (!token) {
      setError("Please log in to view your games.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const data = await getGames(token);
      setGames(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load games.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGames();
  }, [token]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !newGameName.trim()) return;

    try {
      setSaving(true);
      setError("");

      const createdGame = await createGame(token, newGameName.trim());

      setGames(current => [createdGame, ...current]);
      setNewGameName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create game.");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(game: Game) {
    setEditingGameId(game.gameId);
    setEditingName(game.name);
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || editingGameId === null || !editingName.trim()) return;

    try {
      setSaving(true);
      setError("");

      const updatedGame = await updateGame(
        token,
        editingGameId,
        editingName.trim()
      );

      setGames(current =>
        current.map(game =>
          game.gameId === updatedGame.gameId ? updatedGame : game
        )
      );

      setEditingGameId(null);
      setEditingName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update game.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(game: Game) {
    if (!token) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${game.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      await deleteGame(token, game.gameId);

      setGames(current =>
        current.filter(item => item.gameId !== game.gameId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete game.");
    }
  }

  return (
    <div className="py-3">

      <div className="mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <h1 className="mb-0">My Games</h1>
        </div>

        <section
          className="welcome-banner p-4 p-md-5 mb-4 rounded-3 text-white"
          aria-labelledby="questions-welcome-heading"
        >
          <h2 id="questions-welcome-heading">
            Welcome to Your Custom Games Collection!
            <span aria-hidden="true"> 🎮</span>
          </h2>

          <p className="mb-3">
            Create your own custom games and add your favorite questions to them.
          </p>

          <p className="mb-0">
            Choose between three difficulty levels and six categories to create
            a game to help you learn coding in a more fun way. You can also edit
            or delete your games at any time, so get started and create your
            first custom game today!
          </p>
        </section>
      </div>

      {/* Create game */}
      <section className="card mb-4" aria-labelledby="create-game-heading">
        <div className="card-body">
          <h2 id="create-game-heading" className="h4 mb-3">
            Create a New Game
          </h2>

          <form onSubmit={handleCreate}>
            <label htmlFor="new-game-name" className="form-label">
              Game name
            </label>

            <div className="d-flex flex-column flex-md-row gap-2">
              <input
                id="new-game-name"
                type="text"
                className="form-control"
                value={newGameName}
                onChange={event => setNewGameName(event.target.value)}
                minLength={2}
                maxLength={50}
                required
                placeholder="Enter a game name"
              />

              <button
                type="submit"
                className="btn btn-primary text-nowrap"
                disabled={saving}
              >
                {saving ? "Creating..." : "Create New Game"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Saved games */}
      <section aria-labelledby="saved-games-heading">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 id="saved-games-heading" className="h4 mb-0">
            Saved Games
          </h2>

          <span
            className="badge bg-secondary"
            aria-label={`${games.length} custom games`}
          >
            {games.length} game(s)
          </span>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <p role="status">Loading your games...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <caption className="visually-hidden">
                Custom games belonging to your account, including play count,
                creation date and available actions
              </caption>

              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Times Played</th>
                  <th scope="col">Created At</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>

              <tbody>
                {games.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      <strong>No custom games yet</strong>
                      <p className="text-muted mb-0">
                        Create your first custom game above to add your own
                        questions.
                      </p>
                    </td>
                  </tr>
                ) : (
                  games.map(game => (
                    <tr key={game.gameId}>
                      <th scope="row">
                        {editingGameId === game.gameId ? (
                          <form
                            onSubmit={handleUpdate}
                            className="d-flex flex-wrap gap-2"
                          >
                            <label
                              htmlFor={`edit-game-${game.gameId}`}
                              className="visually-hidden"
                            >
                              Edit game name
                            </label>
                            <input
                              id={`edit-game-${game.gameId}`}
                              className="form-control w-auto"
                              value={editingName}
                              onChange={event => setEditingName(event.target.value)}
                              minLength={2}
                              maxLength={50}
                              required
                            />
                            <button
                              type="submit"
                              className="btn btn-sm btn-success"
                              disabled={saving}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => setEditingGameId(null)}
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          game.name
                        )}
                      </th>

                      <td>{game.timesPlayed}</td>

                      <td>
                        <time dateTime={game.createdAt}>
                          {new Date(game.createdAt).toLocaleString("nb-NO")}
                        </time>
                      </td>

                      <td>
                        <div
                          className="d-flex flex-wrap gap-2"
                          role="group"
                          aria-label={`Actions for ${game.name}`}
                        >
                          <Link
                            to={`/games/${game.gameId}/questions`}
                            className="btn btn-info"
                            aria-label={`Manage questions for ${game.name}`}
                          >
                            Manage Questions
                          </Link>

                          {editingGameId !== game.gameId && (
                            <button
                              type="button"
                              className="btn btn-sm btn-warning"
                              onClick={() => startEditing(game)}
                              aria-label={`Edit game name ${game.name}`}
                            >
                              Edit
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(game)}
                            aria-label={`Delete game ${game.name}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default MyGamesPage;