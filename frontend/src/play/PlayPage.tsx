import {
    useEffect,
    useRef,
    useState,
    type FormEvent
} from "react";

import { useAuth } from "../auth/AuthContext";

import {
    answerQuestion,
    confirmStartGame,
    movePlayer,
    resetGame,
    rollDice,
    selectCenterCategory,
    selectFinalCategory,
    startGame,
    type GamePlayer,
    type GameState
} from "./GameService";

import GameBoard from "./GameBoard";

import WedgeToken from "./WedgeToken";

// =====================================
// Types
// =====================================

type GameMode = "Standard" | "Custom";

type Difficulty = "Easy" | "Medium" | "Hard";

// =====================================
// Play page
// =====================================

function PlayPage() {
    const { isAuthenticated } = useAuth();

    // Custom games will later be loaded from the API
    // for the currently authenticated user.
    const customGames: { id: number; name: string }[] = [];

    const [gameMode, setGameMode] =
        useState<GameMode>("Standard");

    const [difficulty, setDifficulty] =
        useState<Difficulty>("Easy");

    const [playerNames, setPlayerNames] =
        useState<string[]>(["", "", "", "", "", ""]);

    const [error, setError] = useState("");

    // Temporary frontend state.
    // This will later be replaced with game state
    // returned by the backend API.
    const [players, setPlayers] =
        useState<GamePlayer[]>([]);

    const [
        startingPlayerNumber,
        setStartingPlayerNumber
    ] = useState<number | null>(null);

    const [showStarterScreen, setShowStarterScreen] =
        useState(false);

    // Used to move keyboard and screen-reader focus
    // to the starter confirmation screen.
    const starterScreenRef =
        useRef<HTMLDivElement>(null);

    // Used to move keyboard focus into
    // the final center confirmation dialog.
    const finalCenterDialogRef =
        useRef<HTMLDivElement>(null);

    // Used to move keyboard focus into
    // the winner dialog.
    const winnerDialogRef =
        useRef<HTMLDivElement>(null);

     
    const [gameState, setGameState] =
        useState<GameState | null>(null);

    // Stores a pending move into the center
    // while the player confirms the final attempt.
    const [pendingCenterMove, setPendingCenterMove] =
        useState<number | null>(null);

    // Shows a message when a player has
    // collected all six wedges and must
    // reach the center for the final question.
    const [
        showFinalReadyPopup,
        setShowFinalReadyPopup
    ] = useState(false);

    const [
        finalReadyPlayerName,
        setFinalReadyPlayerName
    ] = useState("");


    // Move focus when the starter confirmation
    // screen replaces the setup form.
    useEffect(() => {
        if (showStarterScreen) {
            starterScreenRef.current?.focus();
        }
    }, [showStarterScreen]);

    // Move focus into the final center
    // confirmation dialog when it opens.
    useEffect(() => {
        if (pendingCenterMove !== null) {
            finalCenterDialogRef.current?.focus();
        }
    }, [pendingCenterMove]);


    // Move focus into the winner dialog
    // when the game has ended.
    useEffect(() => {
        if (gameState?.isGameOver) {
            winnerDialogRef.current?.focus();
        }
    }, [gameState?.isGameOver]);

    // Allow the final center confirmation dialog
    // to be closed with the Escape key.
    useEffect(() => {
        if (pendingCenterMove === null) {
            return;
        }

        function handleKeyDown(
            event: KeyboardEvent
        ): void {
            if (event.key === "Escape") {
                setPendingCenterMove(null);
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [pendingCenterMove]);


    // =====================================
    // Player input
    // =====================================

    function handlePlayerNameChange(
        index: number,
        value: string
    ): void {
        setPlayerNames((currentNames) => {
            const updatedNames = [...currentNames];

            updatedNames[index] = value;

            return updatedNames;
        });
    }


        // =====================================
        // Setup submission
        // =====================================

        async function handleSetupSubmit(
            event: FormEvent<HTMLFormElement>
        ): Promise<void> {
            event.preventDefault();

            setError("");

            const enteredPlayers = playerNames
                .map((name, index) => ({
                    id: index + 1,
                    name: name.trim()
                }))
                .filter((player) => player.name.length > 0);


            // Code Pursuit requires between 2 and 6 players.
            if (enteredPlayers.length < 2) {
                setError(
                    "Enter at least two player names."
                );

                return;
            }


            // Prevent duplicate player names.
            const normalizedNames = enteredPlayers.map(
                (player) => player.name.toLowerCase()
            );

            if (
                new Set(normalizedNames).size !==
                normalizedNames.length
            ) {
                setError(
                    "Each player must have a unique name."
                );

                return;
            }


            // Custom games require authentication.
            if (
                gameMode === "Custom" &&
                !isAuthenticated
            ) {
                setError(
                    "You must log in to play a custom game."
                );

                return;
            }


            // A custom game must exist before it can be selected.
            if (
                gameMode === "Custom" &&
                customGames.length === 0
            ) {
                setError(
                    "Create a custom game under My Games first."
                );

                return;
            }


            // =====================================
            // Start game through the backend API
            // =====================================

            try {
                const response = await startGame({
                    gameMode,
                    difficulty,
                    playerNames: enteredPlayers.map(
                        (player) => player.name
                    ),
                    customGameId: null
                });

                // Store the game data returned by the API.
                setPlayers(response.players);

                setStartingPlayerNumber(
                    response.startingPlayerNumber
                );

                // Show the starter confirmation screen.
                setShowStarterScreen(true);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to start the game."
                );
            }
        }


            // =====================================
            // Return to setup
            // =====================================

            function handleChangeSetup(): void {
                setShowStarterScreen(false);
                setStartingPlayerNumber(null);
            }

    // =====================================
    // Confirm game start
    // =====================================

    async function handleConfirmStartGame(): Promise<void> {
        if (startingPlayerNumber === null) {
            setError(
                "No starting player has been selected."
            );

            return;
        }

        try {
            setError("");

            const response = await confirmStartGame({
                gameMode,
                difficulty,
                players,
                startingPlayerNumber
            });

            setGameState(response);

            // The starter confirmation screen is no longer needed.
            setShowStarterScreen(false);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to start the game."
            );
        }
    }
            
    // =====================================
    // Roll dice
    // =====================================

    async function handleRollDice(): Promise<void> {
        if (!gameState) {
            return;
        }

        try {
            setError("");

            const response = await rollDice({
                gameSessionId: gameState.gameSessionId,
                currentPlayerNumber:
                    gameState.currentPlayerNumber
            });

            setGameState(response);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to roll the dice."
            );
        }
    }

    // =====================================
    // Move player
    // =====================================

    async function performMovePlayer(
        boardSpaceId: number
    ): Promise<void> {
        if (!gameState) {
            return;
        }

        try {
            setError("");

            const response = await movePlayer({
                gameSessionId:
                    gameState.gameSessionId,

                currentPlayerNumber:
                    gameState.currentPlayerNumber,

                boardSpaceId
            });

            setGameState(response);
            setPendingCenterMove(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to move the player."
            );
        }
    }


    function handleMovePlayer(
        boardSpaceId: number
    ): void {
        if (!gameState) {
            return;
        }

        const currentPlayer =
            gameState.players.find(
                (player) =>
                    player.playerNumber ===
                    gameState.currentPlayerNumber
            );

        if (!currentPlayer) {
            return;
        }


        // A player with all six wedges must confirm
        // before entering the center for a final attempt.
        if (
            boardSpaceId === 43 &&
            currentPlayer.wedges.length >= 6
        ) {
            setPendingCenterMove(
                boardSpaceId
            );

            return;
        }


        void performMovePlayer(
            boardSpaceId
        );
    }

    // =====================================
    // Answer question
    // =====================================

    async function handleAnswerQuestion(
        selectedAnswer: "A" | "B" | "C" | "D"
    ): Promise<void> {
        if (
            !gameState ||
            !gameState.activeQuestion
        ) {
            return;
        }

        try {
            setError("");

            const answeringPlayerNumber =
                gameState.currentPlayerNumber;

            const playerBeforeAnswer =
                gameState.players.find(
                    (player) =>
                        player.playerNumber ===
                        answeringPlayerNumber
                );


            const response = await answerQuestion({
                gameSessionId:
                    gameState.gameSessionId,

                currentPlayerNumber:
                    answeringPlayerNumber,

                questionId:
                    gameState.activeQuestion.questionId,

                selectedAnswer
            });


            const playerAfterAnswer =
                response.players.find(
                    (player) =>
                        player.playerNumber ===
                        answeringPlayerNumber
                );


            // Show a notification when the player
            // receives their sixth and final wedge.
            if (
                playerBeforeAnswer &&
                playerAfterAnswer &&
                playerBeforeAnswer.wedges.length < 6 &&
                playerAfterAnswer.wedges.length >= 6 &&
                !response.isGameOver
            ) {
                setFinalReadyPlayerName(
                    playerAfterAnswer.playerName
                );

                setShowFinalReadyPopup(true);
            }


            setGameState(response);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to submit the answer."
            );
        }
    }

    // =====================================
    // Select center category
    // =====================================

    async function handleCenterCategory(
        category:
            | "Java"
            | "JavaScript"
            | "HTML/CSS"
            | "Python"
            | "Game History"
            | "C#"
    ): Promise<void> {
        if (!gameState) {
            return;
        }

        try {
            setError("");

            const response = await selectCenterCategory({
                gameSessionId:
                    gameState.gameSessionId,

                currentPlayerNumber:
                    gameState.currentPlayerNumber,

                category
            });

            setGameState(response);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to select the center category."
            );
        }
    }

    // =====================================
    // Select final category
    // =====================================

    async function handleFinalCategory(
        category:
            | "Java"
            | "JavaScript"
            | "HTML/CSS"
            | "Python"
            | "Game History"
            | "C#"
    ): Promise<void> {
        if (!gameState) {
            return;
        }

        try {
            setError("");

            const response = await selectFinalCategory({
                gameSessionId:
                    gameState.gameSessionId,

                currentPlayerNumber:
                    gameState.currentPlayerNumber,

                category
            });

            setGameState(response);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to select the final category."
            );
        }
    }
    
    // =====================================
    // Reset game
    // =====================================

    async function handleResetGame(): Promise<void> {
        if (!gameState) {
            return;
        }

        try {
            setError("");

            await resetGame(
                gameState.gameSessionId
            );

            // Remove the active gameplay state.
            setGameState(null);

            // Clear temporary gameplay state.
            setPendingCenterMove(null);

            // Clear starter state.
            setPlayers([]);
            setStartingPlayerNumber(null);
            setShowStarterScreen(false);

            // Clear the setup fields so a completely
            // new game can be configured.
            setPlayerNames([
                "",
                "",
                "",
                "",
                "",
                ""
            ]);

            setGameMode("Standard");
            setDifficulty("Easy");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to reset the game."
            );
        }
    }


    // =====================================
    // Starter selected screen
    // =====================================
    
    if (gameState) {
        const currentPlayer = gameState.players.find(
            (player) =>
                player.playerNumber ===
                gameState.currentPlayerNumber
        );

        return (
            <>
                {/* =====================================
                    Gameplay heading
                    ===================================== */}

                <div className="gameplay-heading">

                    <div>
                        <h1>
                            Code Pursuit
                        </h1>
                    </div>

                    {/* Reset the active game and return to setup. */}
                   {!gameState.isGameOver && (
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() =>
                                void handleResetGame()
                            }
                        >
                            Reset Game
                        </button>
                    )}

                </div>


                {/* =====================================
                    Gameplay status
                    ===================================== */}

                {gameState.message && (
                    <div
                        className="gameplay-status"
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {gameState.message}
                    </div>
                )}


                {/* =====================================
                    Main gameplay layout
                    ===================================== */}

                <div className="gameplay-layout">

                    {/* Interactive board. */}
                    <GameBoard
                        legalDestinationIds={
                            gameState.legalDestinationIds
                        }
                        players={
                            gameState.players
                        }
                        currentPlayerNumber={
                            gameState.currentPlayerNumber
                        }
                        onMove={handleMovePlayer}
                    />


                    {/* =====================================
                        Gameplay sidebar
                        ===================================== */}

                    <aside
                        className="gameplay-sidebar"
                        aria-label="Game information"
                    >

                        {/* =====================================
                            Current player information
                            ===================================== */}

                        <section className="gameplay-sidebar-card">

                            <h2>
                                Current Player
                            </h2>

                            {currentPlayer && (
                                <div className="wedge-progress-visual">
                                    <WedgeToken
                                        wedges={currentPlayer.wedges}
                                        size="small"
                                        ariaLabel={
                                            `${currentPlayer.playerName} has ` +
                                            `${currentPlayer.wedges.length} of 6 wedges`
                                        }
                                    />

                                    <div>
                                        <h3>
                                            {currentPlayer.playerName}
                                        </h3>

                                        <p>
                                            {currentPlayer.wedges.length}
                                            /6 wedges collected
                                        </p>
                                    </div>
                                </div>
                            )}

                            <p>
                                Player{" "}
                                <strong>
                                    {currentPlayer?.playerNumber}
                                </strong>
                            </p>

                            <p>
                                Board position:{" "}
                                <strong>
                                    {currentPlayer?.boardSpaceId}
                                </strong>
                            </p>

                            <p>
                                Difficulty:{" "}
                                <strong>
                                    {gameState.difficulty}
                                </strong>
                            </p>


                            {/* The current player may roll only
                                when the backend allows it. */}
                            {gameState.canRollDice && (
                                <>
                                    <p>
                                        {currentPlayer?.playerName} can
                                        roll the dice.
                                    </p>

                                    <button
                                        type="button"
                                        className="btn btn-primary w-100"
                                        onClick={handleRollDice}
                                    >
                                        Roll Dice
                                    </button>
                                </>
                            )}


                            {/* Show the dice result while the
                                player is choosing a destination. */}
                            {gameState.isWaitingForMove &&
                                gameState.diceRoll !== null && (
                                    <div
                                        className="gameplay-dice-result"
                                        role="status"
                                        aria-live="polite"
                                    >
                                        <p>
                                            Dice roll:{" "}
                                            <strong>
                                                {gameState.diceRoll}
                                            </strong>
                                        </p>

                                        <p>
                                            Choose one of the highlighted
                                            spaces on the board.
                                        </p>
                                    </div>
                                )}

                        </section>

                        {/* =====================================
                            Center category selection
                            ===================================== */}

                        {gameState.needsCenterCategory && (
                            <section
                                className="gameplay-sidebar-card"
                                aria-labelledby="centerCategoryHeading"
                            >
                                <h2 id="centerCategoryHeading">
                                    Choose Category
                                </h2>

                                <p>
                                    You reached the center.
                                    Choose the category for your question.
                                </p>

                                <div
                                    className="game-answer-grid"
                                    role="group"
                                    aria-label="Choose question category"
                                >
                                    <button
                                        type="button"
                                        className="game-answer-button"
                                        onClick={() =>
                                            handleCenterCategory("Java")
                                        }
                                    >
                                        Java
                                    </button>

                                    <button
                                        type="button"
                                        className="game-answer-button"
                                        onClick={() =>
                                            handleCenterCategory("JavaScript")
                                        }
                                    >
                                        JavaScript
                                    </button>

                                    <button
                                        type="button"
                                        className="game-answer-button"
                                        onClick={() =>
                                            handleCenterCategory("HTML/CSS")
                                        }
                                    >
                                        HTML/CSS
                                    </button>

                                    <button
                                        type="button"
                                        className="game-answer-button"
                                        onClick={() =>
                                            handleCenterCategory("Python")
                                        }
                                    >
                                        Python
                                    </button>

                                    <button
                                        type="button"
                                        className="game-answer-button"
                                        onClick={() =>
                                            handleCenterCategory("Game History")
                                        }
                                    >
                                        Game History
                                    </button>

                                    <button
                                        type="button"
                                        className="game-answer-button"
                                        onClick={() =>
                                            handleCenterCategory("C#")
                                        }
                                    >
                                        C#
                                    </button>
                                </div>
                            </section>
                        )}            

                        {/* =====================================
                            Final category selection
                            ===================================== */}

                        {gameState.needsFinalCategory && (
                            <section
                                className="gameplay-sidebar-card"
                                aria-labelledby="finalCategoryHeading"
                            >
                                <h2 id="finalCategoryHeading">
                                    Final Turn
                                </h2>

                                <p>
                                    The other players must choose
                                    the category for the final question.
                                </p>

                                <div
                                    className="game-answer-grid"
                                    role="group"
                                    aria-label="Choose final question category"
                                >
                                    <button
                                        type="button"
                                        className="game-answer-button"
                                        onClick={() =>
                                            handleFinalCategory("Java")
                                        }
                                    >
                                        Java
                                    </button>

                                    <button
                                        type="button"
                                        className="game-answer-button"
                                        onClick={() =>
                                            handleFinalCategory("JavaScript")
                                        }
                                    >
                                        JavaScript
                                    </button>

                                    <button
                                        type="button"
                                        className="game-answer-button"
                                        onClick={() =>
                                            handleFinalCategory("HTML/CSS")
                                        }
                                    >
                                        HTML/CSS
                                    </button>

                                    <button
                                        type="button"
                                        className="game-answer-button"
                                        onClick={() =>
                                            handleFinalCategory("Python")
                                        }
                                    >
                                        Python
                                    </button>

                                    <button
                                        type="button"
                                        className="game-answer-button"
                                        onClick={() =>
                                            handleFinalCategory("Game History")
                                        }
                                    >
                                        Game History
                                    </button>

                                    <button
                                        type="button"
                                        className="game-answer-button"
                                        onClick={() =>
                                            handleFinalCategory("C#")
                                        }
                                    >
                                        C#
                                    </button>
                                </div>
                            </section>
                        )}


                        {/* =====================================
                            Active question
                            ===================================== */}

                        {gameState.activeQuestion && (
                            <section
                                className="gameplay-sidebar-card game-question-card"
                                aria-labelledby="activeQuestionHeading"
                            >

                                {/* The category is visible as text,
                                    so the question does not depend
                                    only on the board color. */}
                                <p className="game-question-category">
                                    {gameState.activeQuestion.category}
                                </p>


                                <h2 id="activeQuestionHeading">
                                    Question
                                </h2>


                                <p className="game-question-text">
                                    {
                                        gameState
                                            .activeQuestion
                                            .questionText
                                    }
                                </p>


                                {/* Answer buttons submit the selected
                                answer to the backend API. */}
                                <div
                                    className="game-answer-grid"
                                    role="group"
                                    aria-label="Answer choices"
                                >

                                    {/* Answer A */}
                                    <button
                                        type="button"
                                        className="game-answer-button"
                                        onClick={() =>
                                            handleAnswerQuestion("A")
                                        }
                                    >
                                        <span
                                            className="game-answer-letter"
                                            aria-hidden="true"
                                        >
                                            A
                                        </span>

                                        <span>
                                            {
                                                gameState
                                                    .activeQuestion
                                                    .answerA
                                            }
                                        </span>
                                    </button>


                                    {/* Answer B */}
                                    <button
                                        type="button"
                                        className="game-answer-button"
                                        onClick={() =>
                                            handleAnswerQuestion("B")
                                        }
                                    >
                                        <span
                                            className="game-answer-letter"
                                            aria-hidden="true"
                                        >
                                            B
                                        </span>

                                        <span>
                                            {
                                                gameState
                                                    .activeQuestion
                                                    .answerB
                                            }
                                        </span>
                                    </button>


                                    {/* Answer C */}
                                    <button
                                        type="button"
                                        className="game-answer-button"
                                        onClick={() =>
                                            handleAnswerQuestion("C")
                                        }
                                    >
                                        <span
                                            className="game-answer-letter"
                                            aria-hidden="true"
                                        >
                                            C
                                        </span>

                                        <span>
                                            {
                                                gameState
                                                    .activeQuestion
                                                    .answerC
                                            }
                                        </span>
                                    </button>


                                    {/* Answer D */}
                                    <button
                                        type="button"
                                        className="game-answer-button"
                                        onClick={() =>
                                            handleAnswerQuestion("D")
                                        }
                                    >
                                        <span
                                            className="game-answer-letter"
                                            aria-hidden="true"
                                        >
                                            D
                                        </span>

                                        <span>
                                            {
                                                gameState
                                                    .activeQuestion
                                                    .answerD
                                            }
                                        </span>
                                    </button>

                                </div>

                            </section>
                        )}


                        {/* =====================================
                            Player list
                            ===================================== */}

                        <section className="gameplay-sidebar-card">

                            <h2>
                                Players
                            </h2>

                            <div className="player-token-list">

                                {gameState.players.map((player) => {
                                    const isCurrentPlayer =
                                        player.playerNumber ===
                                        gameState.currentPlayerNumber;

                                    return (
                                        <div
                                            key={player.playerNumber}
                                            className={
                                                isCurrentPlayer
                                                    ? "player-token-item current-player-token"
                                                    : "player-token-item"
                                            }
                                        >
                                            <WedgeToken
                                                wedges={player.wedges}
                                                size="small"
                                                ariaLabel={
                                                    `${player.playerName} has ` +
                                                    `${player.wedges.length} of 6 wedges`
                                                }
                                            />

                                            <div className="player-token-text">

                                                <p className="player-token-name">
                                                    {player.playerName}

                                                    {isCurrentPlayer && (
                                                        <span className="visually-hidden">
                                                            {" "}
                                                            - current player
                                                        </span>
                                                    )}
                                                </p>

                                                <p className="player-token-space">
                                                    Player{" "}
                                                    {player.playerNumber}
                                                    {" · "}
                                                    Space{" "}
                                                    {player.boardSpaceId}
                                                    {" · "}
                                                    {player.wedges.length}
                                                    /6 wedges
                                                </p>

                                            </div>
                                        </div>
                                    );
                                })}

                            </div>

                        </section>

                    </aside>
                </div>

                    {/* =====================================
                        Final round ready modal
                        ===================================== */}

                    {showFinalReadyPopup && (
                        <div
                            className="game-modal-backdrop"
                            role="presentation"
                        >
                            <section
                                className="game-modal"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="finalReadyHeading"
                                aria-describedby="finalReadyDescription"
                            >
                                <p className="game-modal-eyebrow">
                                    FINAL ROUND UNLOCKED
                                </p>

                                <h2 id="finalReadyHeading">
                                    All six wedges collected!
                                </h2>

                                <p id="finalReadyDescription">
                                    {finalReadyPlayerName} has collected
                                    all six category wedges.
                                </p>

                                <p>
                                    Reach the center of the board to begin
                                    the final round. Once you enter the center,
                                    the other players will choose the category
                                    for your final question.
                                </p>

                                <div className="game-modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() =>
                                            setShowFinalReadyPopup(false)
                                        }
                                    >
                                        Continue
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* =====================================
                        Final center confirmation
                        ===================================== */}

                    {pendingCenterMove !== null && (
                        <div
                            className="game-modal-backdrop"
                            role="presentation"
                        >
                            <section
                                ref={finalCenterDialogRef}
                                className="game-modal"
                                role="dialog"
                                tabIndex={-1}
                                aria-modal="true"
                                aria-labelledby="finalCenterConfirmHeading"
                                aria-describedby="finalCenterConfirmDescription"
                            >
                                <p className="game-modal-eyebrow">
                                    FINAL TURN
                                </p>

                                <h2 id="finalCenterConfirmHeading">
                                    Enter the center?
                                </h2>

                                <p id="finalCenterConfirmDescription">
                                    {currentPlayer?.playerName} has collected
                                    all six wedges.
                                </p>

                                <p>
                                    Entering the center will begin the final
                                    round. The other players will choose the
                                    category for the final question.
                                </p>

                                <div className="game-modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            setPendingCenterMove(null)
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() =>
                                            void performMovePlayer(
                                                pendingCenterMove
                                            )
                                        }
                                    >
                                        Enter Center
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}
                    

                    {/* =====================================
                        Winner modal
                        ===================================== */}

                    {gameState.isGameOver && (
                        <div
                            className="game-modal-backdrop"
                            role="presentation"
                        >
                            <section
                                ref={winnerDialogRef}
                                className="game-modal"
                                role="dialog"
                                tabIndex={-1}
                                aria-modal="true"
                                aria-labelledby="winnerHeading"
                                aria-describedby="winnerDescription"
                            >
                                <p className="game-modal-eyebrow">
                                    GAME OVER
                                </p>

                                <h2 id="winnerHeading">
                                    {gameState.winnerName} wins!
                                </h2>

                                <p id="winnerDescription">
                                    Congratulations!{" "}
                                    {gameState.winnerName} answered the final
                                    question correctly and won the game.
                                </p>

                                <div className="game-modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() =>
                                            void handleResetGame()
                                        }
                                    >
                                        Start New Game
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

            </>
        );
    }

    if (showStarterScreen) {
        const startingPlayer = players.find(
            (player) =>
                player.playerNumber ===
                startingPlayerNumber
        );

        return (
            <section className="starter-selected-page">

                <div
                    ref={starterScreenRef}
                    className="starter-selected-card"
                    tabIndex={-1}
                >

                    <p className="starter-eyebrow">
                        STARTER SELECTED
                    </p>

                    <div
                        className="starter-dice"
                        aria-hidden="true"
                    >
                        🎲
                    </div>

                    <h1>
                        {startingPlayer?.playerName} starts!
                    </h1>

                    <p className="starter-description">
                        The starter was chosen randomly.
                        Difficulty:{" "}
                        <strong>
                            {difficulty}
                        </strong>.
                    </p>


                    {/* All participating players. */}
                    <div className="starter-player-list">

                        {players.map((player) => {
                            const isStarter =
                                player.playerNumber ===
                                startingPlayerNumber;

                            return (
                                <span
                                    key={player.playerNumber}
                                    className={
                                        isStarter
                                            ? "starter-player-chip starter-player-chip-selected"
                                            : "starter-player-chip"
                                    }
                                >
                                    {player.playerName}

                                    {isStarter && (
                                        <span className="visually-hidden">
                                            {" "}
                                            - starting player
                                        </span>
                                    )}
                                </span>
                            );
                        })}

                    </div>


                    {/* This button will later start
                        the backend game session. */}
                    <button
                        type="button"
                        className="starter-start-button"
                        onClick={handleConfirmStartGame}
                    >
                        Start game
                    </button>


                    <button
                        type="button"
                        className="starter-change-button"
                        onClick={handleChangeSetup}
                    >
                        Change setup
                    </button>

                </div>

            </section>
        );
    }


    // =====================================
    // Game setup screen
    // =====================================

    return (
        <section className="game-setup-page">

            {/* Page introduction. */}
            <div className="setup-page-heading">

                <p className="setup-eyebrow">
                    LOCAL HOT-SEAT GAME
                </p>

                <h1>
                    Set up a new game
                </h1>

                <p className="setup-intro">
                    Enter 2–6 player names, choose one
                    difficulty deck, then let the app
                    randomly choose who starts.
                </p>

            </div>


            <div className="setup-page-layout">

                {/* =====================================
                    Main setup form
                    ===================================== */}

                <div className="setup-main-card">

                    <form onSubmit={handleSetupSubmit}>

                        {error && (
                            <div
                                className="alert alert-warning"
                                role="alert"
                                aria-live="polite"
                            >
                                {error}
                            </div>
                        )}


                        {/* =====================================
                            1. Game mode
                            ===================================== */}

                        <fieldset className="mb-4">

                            <legend className="h2">
                                1. Game mode
                            </legend>

                            <div className="row g-3">

                                {/* Standard game */}
                                <div className="col-md-6">

                                    <div className="card h-100 p-3">

                                        <div className="form-check">

                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                id="standardGameMode"
                                                name="gameMode"
                                                value="Standard"
                                                checked={
                                                    gameMode ===
                                                    "Standard"
                                                }
                                                onChange={() =>
                                                    setGameMode(
                                                        "Standard"
                                                    )
                                                }
                                                aria-describedby="standardGameDescription"
                                            />

                                            <label
                                                className="form-check-label fw-bold"
                                                htmlFor="standardGameMode"
                                            >
                                                Standard Game
                                            </label>

                                        </div>

                                        <p
                                            id="standardGameDescription"
                                            className="text-muted mt-2 mb-0"
                                        >
                                            Play using the standard
                                            Code Pursuit question set.
                                        </p>

                                    </div>

                                </div>


                                {/* Custom game */}
                                <div className="col-md-6">

                                    <div className="card h-100 p-3">

                                        <div className="form-check">

                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                id="customGameMode"
                                                name="gameMode"
                                                value="Custom"
                                                checked={
                                                    gameMode ===
                                                    "Custom"
                                                }
                                                onChange={() =>
                                                    setGameMode(
                                                        "Custom"
                                                    )
                                                }
                                                disabled={
                                                    !isAuthenticated ||
                                                    customGames.length === 0
                                                }
                                                aria-describedby="customGameModeDescription"
                                            />

                                            <label
                                                className="form-check-label fw-bold"
                                                htmlFor="customGameMode"
                                            >
                                                Custom Game
                                            </label>

                                        </div>


                                        <p
                                            id="customGameModeDescription"
                                            className="text-muted mt-2 mb-0"
                                        >
                                            {!isAuthenticated
                                                ? "Login or register to use custom games."
                                                : customGames.length === 0
                                                    ? "Create a custom game under My Games first."
                                                    : "Play using one of your saved custom games."}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </fieldset>


                        {/* =====================================
                            2. Players
                            ===================================== */}

                        <h2>
                            2. Players
                        </h2>

                        <div className="setup-player-grid">

                            {playerNames.map(
                                (playerName, index) => (
                                    <div
                                        className="setup-player-field"
                                        key={index}
                                    >
                                        <label
                                            htmlFor={`player${index + 1}`}
                                        >
                                            Player {index + 1}

                                            {index >= 2 && (
                                                <span>
                                                    {" "}
                                                    (optional)
                                                </span>
                                            )}
                                        </label>

                                        <input
                                            type="text"
                                            id={`player${index + 1}`}
                                            className="form-control"
                                            value={playerName}
                                            placeholder={
                                                index === 0
                                                    ? "Alex"
                                                    : index === 1
                                                        ? "Emma"
                                                        : "Optional"
                                            }
                                            onChange={(event) =>
                                                handlePlayerNameChange(
                                                    index,
                                                    event.target.value
                                                )
                                            }
                                            required={index < 2}
                                            maxLength={30}
                                        />
                                    </div>
                                )
                            )}

                        </div>


                        {/* =====================================
                            3. Difficulty
                            ===================================== */}

                        <fieldset className="mt-4">

                            <legend className="h2 setup-difficulty-heading">
                                3. Question difficulty
                            </legend>


                            <div className="difficulty-card-grid">

                                {/* Easy */}
                                <label
                                    className="difficulty-card difficulty-easy"
                                    htmlFor="difficultyEasy"
                                >
                                    <input
                                        type="radio"
                                        id="difficultyEasy"
                                        name="difficulty"
                                        value="Easy"
                                        checked={
                                            difficulty === "Easy"
                                        }
                                        onChange={() =>
                                            setDifficulty("Easy")
                                        }
                                        aria-describedby="difficultyEasyDescription"
                                    />

                                    <span
                                        className="difficulty-radio"
                                        aria-hidden="true"
                                    />

                                    <span
                                        className="difficulty-icon"
                                        aria-hidden="true"
                                    >
                                        &lt;/&gt;
                                    </span>

                                    <strong>
                                        Easy
                                    </strong>

                                    <span
                                        id="difficultyEasyDescription"
                                        className="difficulty-description"
                                    >
                                        Core concepts and
                                        straightforward questions.
                                    </span>

                                </label>


                                {/* Medium */}
                                <label
                                    className="difficulty-card difficulty-medium"
                                    htmlFor="difficultyMedium"
                                >
                                    <input
                                        type="radio"
                                        id="difficultyMedium"
                                        name="difficulty"
                                        value="Medium"
                                        checked={
                                            difficulty === "Medium"
                                        }
                                        onChange={() =>
                                            setDifficulty(
                                                "Medium"
                                            )
                                        }
                                        aria-describedby="difficultyMediumDescription"
                                    />

                                    <span
                                        className="difficulty-radio"
                                        aria-hidden="true"
                                    />

                                    <span
                                        className="difficulty-icon"
                                        aria-hidden="true"
                                    >
                                        <i className="bi bi-lightbulb-fill difficulty-icon-medium" />
                                    </span>

                                    <strong>
                                        Medium
                                    </strong>

                                    <span
                                        id="difficultyMediumDescription"
                                        className="difficulty-description"
                                    >
                                        More reasoning and short
                                        code examples.
                                    </span>

                                </label>


                                {/* Hard */}
                                <label
                                    className="difficulty-card difficulty-hard"
                                    htmlFor="difficultyHard"
                                >
                                    <input
                                        type="radio"
                                        id="difficultyHard"
                                        name="difficulty"
                                        value="Hard"
                                        checked={
                                            difficulty === "Hard"
                                        }
                                        onChange={() =>
                                            setDifficulty("Hard")
                                        }
                                        aria-describedby="difficultyHardDescription"
                                    />

                                    <span
                                        className="difficulty-radio"
                                        aria-hidden="true"
                                    />

                                    <span
                                        className="difficulty-icon"
                                        aria-hidden="true"
                                    >
                                        <i className="bi bi-star-fill difficulty-icon-hard" />
                                    </span>

                                    <strong>
                                        Hard
                                    </strong>

                                    <span
                                        id="difficultyHardDescription"
                                        className="difficulty-description"
                                    >
                                        Trickier language details
                                        and deeper concepts.
                                    </span>

                                </label>

                            </div>

                        </fieldset>


                        {/* Submit setup. */}
                        <button
                            type="submit"
                            className="setup-start-button"
                        >
                            Choose starting player
                        </button>

                    </form>

                </div>


                {/* =====================================
                    Information panel
                    ===================================== */}

                <aside className="setup-info-card">

                    <div
                        className="setup-deck-preview"
                        aria-hidden="true"
                    >
                        <div className="setup-deck-card deck-easy">
                            <span className="difficulty-preview-icon">
                                &lt;/&gt;
                            </span>

                            <strong>
                                EASY
                            </strong>
                        </div>

                        <div className="setup-deck-card deck-medium">
                            <span className="difficulty-preview-icon">
                                <i className="bi bi-lightbulb-fill difficulty-icon-medium" />
                            </span>

                            <strong>
                                MEDIUM
                            </strong>
                        </div>

                        <div className="setup-deck-card deck-hard">
                            <span className="difficulty-preview-icon">
                                <i className="bi bi-star-fill difficulty-icon-hard" />
                            </span>

                            <strong>
                                HARD
                            </strong>
                        </div>
                    </div>


                    <h3>
                        One deck per game
                    </h3>

                    <p>
                        The difficulty stays the same for
                        all six categories until the game ends.
                    </p>


                    <div className="setup-info-stat">
                        <strong>
                            2–6
                        </strong>

                        <span>
                            local players
                        </span>
                    </div>

                    <div className="setup-info-stat">
                        <strong>
                            6
                        </strong>

                        <span>
                            categories to collect
                        </span>
                    </div>

                    <div className="setup-info-stat">
                        <strong>
                            1 PC
                        </strong>

                        <span>
                            pass the screen between turns
                        </span>
                    </div>

                </aside>

            </div>

        </section>
    );
}

export default PlayPage;