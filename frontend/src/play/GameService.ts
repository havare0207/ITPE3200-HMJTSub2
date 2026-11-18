const GAMEPLAY_API_URL = "http://localhost:5234/api/gameplay";
const API_BASE_URL = "http://localhost:5234";


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
    request: StartGameRequest
): Promise<StartGameResponse> {
    const response = await fetch(
        `${GAMEPLAY_API_URL}/start`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

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
    request: ConfirmStartGameRequest
): Promise<GameState> {
    const response = await fetch(
        `${GAMEPLAY_API_URL}/confirm`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

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
    request: RollDiceRequest
): Promise<GameState> {
    const response = await fetch(
        `${GAMEPLAY_API_URL}/roll-dice`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(request)
        }
    );

    return handleResponse<GameState>(
        response
    );
}

// =====================================
// Move player
// =====================================

export async function movePlayer(
    request: MovePlayerRequest
): Promise<GameState> {
    const response = await fetch(
        `${GAMEPLAY_API_URL}/move`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(request)
        }
    );

    return handleResponse<GameState>(
        response
    );
}

export async function answerQuestion(
    request: AnswerQuestionRequest
): Promise<GameState> {
    const response = await fetch(
        `${API_BASE_URL}/api/Gameplay/answer`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(request)
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message ??
            "Unable to submit the answer."
        );
    }

    return await response.json() as GameState;
}

export async function selectCenterCategory(
    request: SelectCenterCategoryRequest
): Promise<GameState> {
    const response = await fetch(
        `${API_BASE_URL}/api/Gameplay/select-center-category`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(request)
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message ??
            "Unable to select the center category."
        );
    }

    return await response.json() as GameState;
}

export async function selectFinalCategory(
    request: SelectFinalCategoryRequest
): Promise<GameState> {
    const response = await fetch(
        `${API_BASE_URL}/api/Gameplay/select-final-category`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request)
        }
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.message ??
            "Unable to select the final category."
        );
    }

    return await response.json() as GameState;
}

export async function resetGame(
    gameSessionId: string
): Promise<void> {
    const response = await fetch(
        `${API_BASE_URL}/api/Gameplay/reset/${gameSessionId}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        let message =
            "Unable to reset the game.";

        try {
            const errorData = await response.json();

            message =
                errorData.message ?? message;
        } catch {
            // Keep the default error message
            // if the response has no JSON body.
        }

        throw new Error(message);
    }
}