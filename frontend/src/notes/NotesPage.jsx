
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotes } from "./NoteService";
import { useAuth } from "../auth/AuthContext";

function NotesPage() {
    const { token } = useAuth();

    const [notes, setNotes] = useState([]);
    const [searchString, setSearchString] = useState("");

    useEffect(() => {
        document.title = "Explore Notes";
    }, []);

    useEffect(() => {
        async function loadNotes() {
            if (!token) {
                setNotes([]);
                return;
            }

            try {
                const data = await getNotes(token);
                setNotes(data);
            } catch (error) {
                console.error("Unable to load notes:", error);
                setNotes([]);
            }
        }

        loadNotes();
    }, [token]);

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchString.toLowerCase())
    );

    return (
        <div className="explore-notes">
            <div className="mb-4">
                <h1 className="mb-3">Explore Notes</h1>

                <section className="welcome-banner p-4 p-md-5 mb-4 rounded-3 text-white">
                    <h2>
                        Welcome to Your Notes! 📝
                    </h2>

                    <p className="mb-0">
                        Explore your notes, organize your ideas,
                        and keep track of what you have learned.
                    </p>
                </section>
            </div>

            <div className="mb-4">
                <label
                    htmlFor="note-search"
                    className="form-label"
                >
                    Search Notes
                </label>

                <input
                    id="note-search"
                    type="text"
                    className="form-control"
                    placeholder="Search by title..."
                    value={searchString}
                    onChange={event =>
                        setSearchString(event.target.value)
                    }
                />
            </div>

            <section>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h5 mb-0">Notes</h2>

                    <div className="d-flex align-items-center gap-3">
                        <span className="badge bg-secondary">
                            {filteredNotes.length} note(s)
                        </span>

                        <Link
                            to="/notes/create"
                            className="btn btn-primary"
                        >
                            + Create Note
                        </Link>
                    </div>
                </div>

                {filteredNotes.length === 0 ? (
                    <div className="text-center py-4">
                        <strong>No notes found</strong>
                        <p className="text-muted">
                            Your notes will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th scope="col">Title</th>
                                    <th scope="col">Content</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredNotes.map(note => (
                                    <tr key={note.noteId}>
                                        <th scope="row">
                                            {note.title}
                                        </th>
                                        <td>{note.content}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default NotesPage;
