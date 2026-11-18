const API_URL = "/api/notes";

// Get all notes from the backend.
export async function getNotes(token) {
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
export async function createNote(note, token) {
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
