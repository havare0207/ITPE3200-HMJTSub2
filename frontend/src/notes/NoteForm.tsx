import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createNote, getNoteById, updateNote } from "./NoteService";
import { useAuth } from "../auth/AuthContext";

function NoteForm() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    const isEditing = id !== undefined;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditing);
    const [loadFailed, setLoadFailed] = useState(false);
    const [error, setError] = useState("");

    // Load an existing note when editing.
    useEffect(() => {
        if (!isEditing || !token) {
            return;
        }

        async function loadNote() {
            setIsLoading(true);
            setLoadFailed(false);
            setError("");

            try {
                const note = await getNoteById(Number(id), token!);

                setTitle(note.title);
                setContent(note.content);
            } catch (error) {
                console.error("Unable to load note:", error);
                setError("Unable to load note.");
                setLoadFailed(true);
            } finally {
                setIsLoading(false);
            }
        }

        loadNote();
    }, [id, token, isEditing]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!token) {
            setError("You must be logged in to save a note.");
            return;
        }

        if (isLoading || loadFailed || isSaving) {
            return;
        }

        setIsSaving(true);
        setError("");

        try {
            const note = {
                title: title,
                content: content
            };

            if (isEditing) {
                await updateNote(Number(id), note, token);
            } else {
                await createNote(note, token);
            }

            navigate("/notes");
        } catch (error) {
            console.error("Unable to save note:", error);
            setError("Unable to save note. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return <p>Loading note...</p>;
    }

    return (
        <div className="py-3">
            <div className="mb-4">
                <h1>{isEditing ? "Edit Note" : "Create Note"}</h1>

                <p className="text-muted">
                    {isEditing
                        ? "Update your existing note."
                        : "Write a new note to save your ideas."}
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
                                rows={6}
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
                                disabled={isSaving || !token || loadFailed}
                            >
                                {isSaving
                                    ? "Saving..."
                                    : isEditing
                                        ? "Save Changes"
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