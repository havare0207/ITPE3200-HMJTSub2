const API_URL = "/api/notes";

export interface Note {
    noteId: number;
    title: string;
    content: string;
    createdAt: string;
}

export interface CreateNote {
    title: string;
    content: string;
}

// Get all notes from the backend.
export async function getNotes(token: string): Promise<Note[]> {
    const response = await fetch(API_URL, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Unable to load notes.");
    }

    return await response.json();
}

// Create a new note.
export async function createNote(
    note: CreateNote,
    token: string
): Promise<Note> {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(note)
    });

    if (!response.ok) {
        throw new Error("Unable to create note.");
    }

    return await response.json();
}

// Get a single note by ID.
export async function getNoteById(
    id: number,
    token: string
): Promise<Note> {
    const response = await fetch(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Unable to load note.");
    }

    return await response.json();
}

// Update an existing note.
export async function updateNote(
    id: number,
    note: CreateNote,
    token: string
): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(note)
    });

    if (!response.ok) {
        throw new Error("Unable to update note.");
    }
}

// Delete an existing note.
export async function deleteNote(
    id: number,
    token: string
): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Unable to delete note.");
    }
}