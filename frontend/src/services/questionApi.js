
// Base URL of the Questions API.
// Replace the port with the HTTPS port from your API launchSettings.json.
const API_URL = "http://localhost:5234/api/questions";

// Reads an API response and handles errors consistently.
async function handleResponse(response) {
    if (!response.ok) {
        let message = "Something went wrong.";

        try {
            const errorData = await response.json();

            message =
                errorData.detail ||
                errorData.title ||
                errorData.message ||
                message;
        } catch {
            // The response may not contain JSON.
            message = response.statusText || message;
        }

        throw new Error(message);
    }

    // DELETE returns 204 No Content.
    if (response.status === 204) {
        return null;
    }

    return await response.json();
}

// Retrieves questions with optional search and filter parameters.
export async function getQuestions(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            params.append(key, value);
        }
    });

    const queryString = params.toString();
    const url = queryString
        ? `${API_URL}?${queryString}`
        : API_URL;

    const response = await fetch(url);

    return handleResponse(response);
}

// Retrieves one question by ID.
export async function getQuestionById(id) {
    const response = await fetch(`${API_URL}/${id}`);

    return handleResponse(response);
}

// Creates a new question.
export async function createQuestion(questionData) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(questionData)
    });

    return handleResponse(response);
}

// Updates an existing question.
export async function updateQuestion(id, questionData) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(questionData)
    });

    return handleResponse(response);
}

// Deletes a question.
export async function deleteQuestion(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    return handleResponse(response);
}