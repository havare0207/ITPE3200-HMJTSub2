const GAMEPLAY_API_URL = "http://localhost:5234/api/gameplay";


export interface StartGameRequest {
    gameMode: "Standard" | "Custom";
    difficulty: "Easy" | "Medium" | "Hard";
    playerNames: string[];
    customGameId: number | null;
}

export interface GamePlayer {
    playerNumber: number;
    playerName: string;
}

export interface StartGameResponse {
    gameMode: "Standard" | "Custom";
    difficulty: "Easy" | "Medium" | "Hard";
    players: GamePlayer[];
    startingPlayerNumber: number;
    startingPlayerName: string;
}

export interface ConfirmStartGameRequest {
    gameMode: "Standard" | "Custom";
    difficulty: "Easy" | "Medium" | "Hard";
    players: GamePlayer[];
    startingPlayerNumber: number;
    customGameId: number | null;
}

export interface GamePlayerState {
    playerNumber: number;
    playerName: string;
    boardSpaceId: number;
    wedges: string[];
}

export interface GameState {
    gameSessionId: string;
    gameMode: "Standard" | "Custom";
    difficulty: "Easy" | "Medium" | "Hard";

    players: GamePlayerState[];

    currentPlayerNumber: number;

    canRollDice: boolean;

    diceRoll: number | null;

    isWaitingForMove: boolean;

    legalDestinationIds: number[];

    activeQuestion: ActiveQuestion | null;

    isGameOver: boolean;

    winnerName: string | null;

    message: string;

    needsCenterCategory: boolean;

    needsFinalCategory: boolean;

    isFinalQuestion: boolean;

}

export interface RollDiceRequest {
    gameSessionId: string;
    currentPlayerNumber: number;
}

export interface MovePlayerRequest {
    gameSessionId: string;
    currentPlayerNumber: number;
    boardSpaceId: number;
}

export interface ActiveQuestion {
    questionId: number;
    category: string;
    questionText: string;
    answerA: string;
    answerB: string;
    answerC: string;
    answerD: string;
}

export interface AnswerQuestionRequest {
    gameSessionId: string;
    currentPlayerNumber: number;
    questionId: number;
    selectedAnswer: "A" | "B" | "C" | "D";
}

export interface SelectCenterCategoryRequest {
    gameSessionId: string;
    currentPlayerNumber: number;
    category:
        | "Java"
        | "JavaScript"
        | "HTML/CSS"
        | "Python"
        | "Game History"
        | "C#";
}

export interface SelectFinalCategoryRequest {
    gameSessionId: string;
    currentPlayerNumber: number;
    category:
        | "Java"
        | "JavaScript"
        | "HTML/CSS"
        | "Python"
        | "Game History"
        | "C#";
}

export interface CustomGameDifficulty {
    difficulty: "Easy" | "Medium" | "Hard";
    isAvailable: boolean;
    availableCategoryCount: number;
    missingCategories: string[];
}

// =====================================
// Shared request headers
// =====================================

function getHeaders(
    token: string | null,
    hasBody: boolean = true
): Record<string, string> {
    const headers: Record<string, string> = {};

    if (hasBody) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
}

// =====================================
// Shared response handling
// =====================================

async function handleResponse<T>(
    response: Response
): Promise<T> {
    if (!response.ok) {
        let message = "Something went wrong.";

        try {
            const errorData = await response.json();

            message =
                errorData.message ||
                errorData.detail ||
                errorData.title ||
                message;
        } catch {
            message =
                response.statusText ||
                message;
        }

        throw new Error(message);
    }

    return await response.json() as T;
}


// =====================================
// Start game
// =====================================

export async function startGame(
    request: StartGameRequest,
    token: string | null = null
): Promise<StartGameResponse> {
    const response = await fetch(
        `${GAMEPLAY_API_URL}/start`,
        {
            method: "POST",

            headers: getHeaders(token),

            body: JSON.stringify(request)
        }
    );

    return handleResponse<StartGameResponse>(
        response
    );
}

// =====================================
// Confirm game start
// =====================================

export async function confirmStartGame(
    request: ConfirmStartGameRequest,
    token: string | null = null
): Promise<GameState> {
    const response = await fetch(
        `${GAMEPLAY_API_URL}/confirm`,
        {
            method: "POST",

            headers: getHeaders(token),

            body: JSON.stringify(request)
        }
    );

    return handleResponse<GameState>(
        response
    );
}

// =====================================
// Roll dice
// =====================================

export async function rollDice(
    request: RollDiceRequest,
    token: string | null = null
): Promise<GameState> {
    const response = await fetch(
        `${GAMEPLAY_API_URL}/roll-dice`,
        {
            method: "POST",
            headers: getHeaders(token),
            body: JSON.stringify(request)
        }
    );

    return handleResponse<GameState>(response);
}

// =====================================
// Move player
// =====================================

export async function movePlayer(
    request: MovePlayerRequest,
    token: string | null = null
): Promise<GameState> {
    const response = await fetch(
        `${GAMEPLAY_API_URL}/move`,
        {
            method: "POST",
            headers: getHeaders(token),
            body: JSON.stringify(request)
        }
    );

    return handleResponse<GameState>(response);
}

// =====================================
// Answer question
// =====================================

export async function answerQuestion(
    request: AnswerQuestionRequest,
    token: string | null = null
): Promise<GameState> {
    const response = await fetch(
        `${GAMEPLAY_API_URL}/answer`,
        {
            method: "POST",
            headers: getHeaders(token),
            body: JSON.stringify(request)
        }
    );

    return handleResponse<GameState>(response);
}

// =====================================
// Select center category
// =====================================

export async function selectCenterCategory(
    request: SelectCenterCategoryRequest,
    token: string | null = null
): Promise<GameState> {
    const response = await fetch(
        `${GAMEPLAY_API_URL}/select-center-category`,
        {
            method: "POST",
            headers: getHeaders(token),
            body: JSON.stringify(request)
        }
    );

    return handleResponse<GameState>(response);
}

// =====================================
// Select final category
// =====================================

export async function selectFinalCategory(
    request: SelectFinalCategoryRequest,
    token: string | null = null
): Promise<GameState> {
    const response = await fetch(
        `${GAMEPLAY_API_URL}/select-final-category`,
        {
            method: "POST",
            headers: getHeaders(token),
            body: JSON.stringify(request)
        }
    );

    return handleResponse<GameState>(response);
}

// =====================================
// Reset game
// =====================================

export async function resetGame(
    gameSessionId: string,
    token: string | null = null
): Promise<void> {
    const response = await fetch(
        `${GAMEPLAY_API_URL}/reset/${gameSessionId}`,
        {
            method: "DELETE",
            headers: getHeaders(token, false)
        }
    );

    if (!response.ok) {
        await handleResponse<never>(response);
    }
}

// =====================================
// Get available custom game difficulties
// =====================================

export async function getCustomGameDifficulties(
    customGameId: number,
    token: string
): Promise<CustomGameDifficulty[]> {
    const response = await fetch(
        `${GAMEPLAY_API_URL}/custom/${customGameId}/difficulties`,
        {
            method: "GET",
            headers: getHeaders(token, false)
        }
    );

    return handleResponse<CustomGameDifficulty[]>(
        response
    );
}