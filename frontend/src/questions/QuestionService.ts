
import type {
    Question,
    QuestionFormData,
    CreateQuestionData,
    QuestionFilters
} from "./QuestionTypes";

// Base URL of the Questions API.
// Replace the port with the HTTPS port from your API launchSettings.json.
const API_URL = "http://localhost:5234/api/questions";

// Reads an API response and handles errors consistently.
async function handleResponse<T>(response: Response): Promise<T | null> {
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

    return await response.json() as T;
}

// Retrieves questions with optional search and filter parameters.
export async function getQuestions(
    filters: QuestionFilters = {}
): Promise<Question[]> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
        }
    });

    const queryString = params.toString();
    const url = queryString
        ? `${API_URL}?${queryString}`
        : API_URL;

    const response = await fetch(url);

    const data = await handleResponse<Question[]>(response);

    return data ?? [];
}

// Retrieves one question by ID.
export async function getQuestionById(
    id: string | number
): Promise<Question> {
    const response = await fetch(`${API_URL}/${id}`);

    const data = await handleResponse<Question>(response);

    if (!data) {
        throw new Error("Question not found.");
    }

    return data;
}

// Creates a new question.
export async function createQuestion(
    questionData: CreateQuestionData
): Promise<Question> {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(questionData)
    });

    const data = await handleResponse<Question>(response);

    if (!data) {
        throw new Error("The question could not be created.");
    }

    return data;
}

// Updates an existing question.
export async function updateQuestion(
    id: string | number,
    questionData: QuestionFormData
): Promise<Question> {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(questionData)
    });

    const data = await handleResponse<Question>(response);

    if (!data) {
        throw new Error("The question could not be updated.");
    }

    return data;
}

// Deletes a question.
export async function deleteQuestion(
    id: string | number
): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    await handleResponse<null>(response);
}
