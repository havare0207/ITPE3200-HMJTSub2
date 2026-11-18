
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createNote } from "./NoteService";
import { useAuth } from "../auth/AuthContext";

function NoteForm() {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        if (!token) {
            setError("You must be logged in to create a note.");
            return;
        }

        setIsSaving(true);
        setError("");

        try {
            await createNote(
                {
                    title: title,
                    content: content
                },
                token
            );

            navigate("/notes");
        } catch (error) {
            console.error("Unable to create note:", error);
            setError("Unable to save note. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="py-3">
            <div className="mb-4">
                <h1>Create Note</h1>

                <p className="text-muted">
                    Write a new note to save your ideas.
                </p>

                <p className="text-muted">
                    Fields marked with{" "}
                    <span className="text-danger">*</span>
                    {" "}are required.
                </p>
            </div>

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div
                                className="alert alert-danger"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        <div className="mb-3">
                            <label
                                htmlFor="noteTitle"
                                className="form-label"
                            >
                                Title{" "}
                                <span className="text-danger">*</span>
                            </label>

                            <input
                                id="noteTitle"
                                type="text"
                                className="form-control"
                                value={title}
                                onChange={event =>
                                    setTitle(event.target.value)
                                }
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label
                                htmlFor="noteContent"
                                className="form-label"
                            >
                                Content{" "}
                                <span className="text-danger">*</span>
                            </label>

                            <textarea
                                id="noteContent"
                                className="form-control"
                                rows="6"
                                value={content}
                                onChange={event =>
                                    setContent(event.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSaving || !token}
                            >
                                {isSaving
                                    ? "Saving..."
                                    : "Create Note"}
                            </button>

                            <Link
                                to="/notes"
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

export default NoteForm;
