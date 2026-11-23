
const API_URL = "http://localhost:5234/api/games";

export interface Game {
  gameId: number;
  name: string;
  status: string | number;
  createdAt: string;
  timesPlayed: number;
}

async function handleResponse(response: Response) {
  if (response.ok) {
    if (response.status === 204) return null;
    return response.json();
  }

  let message = `Request failed (${response.status})`;

  try {
    const data = await response.json();
    message = data.message || data.title || message;
  } catch {
    // Keep the default error message.
  }

  if (response.status === 401) {
    message = "Your session has expired. Please log in again.";
  }

  throw new Error(message);
}

function authHeaders(token: string, hasBody = false) {
  return {
    Authorization: `Bearer ${token}`,
    ...(hasBody ? { "Content-Type": "application/json" } : {})
  };
}

export async function getGames(token: string): Promise<Game[]> {
  const response = await fetch(API_URL, {
    headers: authHeaders(token)
  });

  return handleResponse(response);
}

export async function createGame(
  token: string,
  name: string
): Promise<Game> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders(token, true),
    body: JSON.stringify({ name })
  });

  return handleResponse(response);
}

export async function updateGame(
  token: string,
  id: number,
  name: string
): Promise<Game> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(token, true),
    body: JSON.stringify({ name })
  });

  return handleResponse(response);
}

export async function deleteGame(
  token: string,
  id: number
): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  await handleResponse(response);
}
