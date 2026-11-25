import type {
    Question,
    QuestionFormData,
    CreateQuestionData,
    QuestionFilters
} from "./QuestionTypes";

// Base URL of the Questions API.
// Replace the port with the HTTPS port from your API launchSettings.json.
const API_URL = "http://localhost:5234/api/questions";


// =====================================
// Authentication
// =====================================

// Retrieves the JWT token stored after a successful login.
function getAuthHeaders(): HeadersInit {

    // Retrieve the JWT token using the same key
    // as AuthContext.
    const token = localStorage.getItem("codePursuitToken");

    // Stop the request if no token exists.
    if (!token) {
        throw new Error(
            "You are not logged in. Please log in again."
        );
    }

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

// =====================================
// Response handling
// =====================================

// Reads an API response and handles errors consistently.
async function handleResponse<T>(
    response: Response
): Promise<T | null> {

    // Check whether the API request was successful.
    if (!response.ok) {

        let message = "Something went wrong.";

        try {
            // Try to read the error returned by the API.
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

        // Display the API error to the calling component.
        throw new Error(message);
    }

    // DELETE returns 204 No Content.
    if (response.status === 204) {
        return null;
    }

    // Convert the successful JSON response into the expected type.
    return await response.json() as T;
}


// =====================================
// Get all questions
// =====================================

// Retrieves questions belonging to the logged-in user.
// Supports optional searching and filtering.
export async function getQuestions(
    filters: QuestionFilters = {}
): Promise<Question[]> {

    // Create query parameters for the filters.
    const params = new URLSearchParams();

    // Add filters that have values.
    Object.entries(filters).forEach(([key, value]) => {

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            params.append(key, String(value));
        }
    });

    // Build the URL with the query parameters.
    const queryString = params.toString();

    const url = queryString
        ? `${API_URL}?${queryString}`
        : API_URL;

    // Send the GET request with the JWT authentication header.
    const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders()
    });

    // Handle the API response.
    const data = await handleResponse<Question[]>(response);

    // Return an empty array if no questions are found.
    return data ?? [];
}


// =====================================
// Get question by ID
// =====================================

// Retrieves one question by its ID.
// The backend checks that the question belongs to the logged-in user.
export async function getQuestionById(
    id: string | number
): Promise<Question> {

    // Send the GET request with authentication.
    const response = await fetch(`${API_URL}/${id}`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    // Handle the API response.
    const data = await handleResponse<Question>(response);

    // Throw an error if the question does not exist.
    if (!data) {
        throw new Error("Question not found.");
    }

    return data;
}


// =====================================
// Create question
// =====================================

// Creates a new question for a game.
// The backend uses the JWT token to identify the logged-in user.
export async function createQuestion(
    questionData: CreateQuestionData
): Promise<Question> {

    // Send the POST request with authentication.
    const response = await fetch(API_URL, {
        method: "POST",

        // Include the JWT token and JSON content type.
        headers: getAuthHeaders(),

        // Convert the question data into JSON.
        body: JSON.stringify(questionData)
    });

    // Handle the API response.
    const data = await handleResponse<Question>(response);

    // Throw an error if the question was not created.
    if (!data) {
        throw new Error(
            "The question could not be created."
        );
    }

    return data;
}


// =====================================
// Update question
// =====================================

// Updates an existing question.
// The backend verifies ownership before saving changes.
export async function updateQuestion(
    id: string | number,
    questionData: QuestionFormData
): Promise<Question> {

    // Send the PUT request with authentication.
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",

        // Include the JWT token.
        headers: getAuthHeaders(),

        // Convert the updated question data into JSON.
        body: JSON.stringify(questionData)
    });

    // Handle the API response.
    const data = await handleResponse<Question>(response);

    // Throw an error if the question was not updated.
    if (!data) {
        throw new Error(
            "The question could not be updated."
        );
    }

    return data;
}


// =====================================
// Delete question
// =====================================

// Deletes a question by its ID.
// The backend checks that the question belongs to the logged-in user.
export async function deleteQuestion(
    id: string | number
): Promise<void> {

    // Send the DELETE request with authentication.
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",

        // Include the JWT token.
        headers: getAuthHeaders()
    });

    // Handle the API response.
    // A successful DELETE normally returns 204 No Content.
    await handleResponse<null>(response);
}
