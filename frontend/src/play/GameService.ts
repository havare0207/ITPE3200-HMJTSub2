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
    isGameOver: boolean;
    winnerName: string | null;
    message: string;
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