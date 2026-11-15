import type { CSSProperties } from "react";

import type {
    GamePlayerState
} from "./GameService";

// =====================================
// Board types
// =====================================

type Category =
    | "Java"
    | "JavaScript"
    | "HTML/CSS"
    | "Python"
    | "Game History"
    | "C#";

interface BoardSpace {
    id: number;
    x: string;
    y: string;
    category?: Category;
    rollAgain?: boolean;
    inner?: boolean;
}

interface GameBoardProps {
    legalDestinationIds: number[];
    players: GamePlayerState[];
    currentPlayerNumber: number;
    onMove: (boardSpaceId: number) => void;
}


// =====================================
// Category colors
// =====================================

const categoryColors: Record<Category, string> = {
    Java: "#3182e8",
    Python: "#f6ca46",
    "C#": "#9748dc",
    "HTML/CSS": "#f59a45",
    JavaScript: "#25ad63",
    "Game History": "#ec407a"
};


// =====================================
// Board spaces
// =====================================

const boardSpaces: BoardSpace[] = [

    // Outer ring.
    { id: 1, x: "39%", y: "10%", category: "C#" },
    { id: 2, x: "50%", y: "8%", category: "Game History" },
    { id: 3, x: "61%", y: "10%", category: "JavaScript" },
    { id: 4, x: "72%", y: "15%", rollAgain: true },

    { id: 5, x: "82%", y: "22%", category: "Python" },
    { id: 6, x: "89%", y: "32%", category: "C#" },
    { id: 7, x: "93%", y: "42%", category: "Java" },
    { id: 8, x: "95%", y: "50%", rollAgain: true },

    { id: 9, x: "93%", y: "58%", category: "HTML/CSS" },
    { id: 10, x: "89%", y: "68%", category: "Game History" },
    { id: 11, x: "82%", y: "78%", category: "Python" },
    { id: 12, x: "72%", y: "85%", rollAgain: true },

    { id: 13, x: "61%", y: "90%", category: "JavaScript" },
    { id: 14, x: "50%", y: "92%", category: "Java" },
    { id: 15, x: "39%", y: "90%", category: "C#" },
    { id: 16, x: "28%", y: "85%", rollAgain: true },

    { id: 17, x: "18%", y: "78%", category: "HTML/CSS" },
    { id: 18, x: "11%", y: "68%", category: "Python" },
    { id: 19, x: "7%", y: "58%", category: "Game History" },
    { id: 20, x: "5%", y: "50%", rollAgain: true },

    { id: 21, x: "7%", y: "42%", category: "Java" },
    { id: 22, x: "11%", y: "32%", category: "HTML/CSS" },
    { id: 23, x: "18%", y: "22%", category: "JavaScript" },
    { id: 24, x: "28%", y: "15%", rollAgain: true },


    // Game History path.
    {
        id: 25,
        x: "50%",
        y: "22%",
        category: "Game History",
        inner: true
    },
    {
        id: 26,
        x: "50%",
        y: "31%",
        category: "Python",
        inner: true
    },
    {
        id: 27,
        x: "50%",
        y: "40%",
        category: "Java",
        inner: true
    },


    // Java path.
    {
        id: 28,
        x: "76%",
        y: "35%",
        category: "Java",
        inner: true
    },
    {
        id: 29,
        x: "68%",
        y: "39.5%",
        category: "HTML/CSS",
        inner: true
    },
    {
        id: 30,
        x: "60%",
        y: "44%",
        category: "C#",
        inner: true
    },


    // Python path.
    {
        id: 31,
        x: "76%",
        y: "65%",
        category: "Python",
        inner: true
    },
    {
        id: 32,
        x: "68%",
        y: "60.5%",
        category: "JavaScript",
        inner: true
    },
    {
        id: 33,
        x: "60%",
        y: "56%",
        category: "Game History",
        inner: true
    },


    // C# path.
    {
        id: 34,
        x: "50%",
        y: "78%",
        category: "C#",
        inner: true
    },
    {
        id: 35,
        x: "50%",
        y: "69%",
        category: "Java",
        inner: true
    },
    {
        id: 36,
        x: "50%",
        y: "60%",
        category: "HTML/CSS",
        inner: true
    },


    // HTML/CSS path.
    {
        id: 37,
        x: "24%",
        y: "65%",
        category: "HTML/CSS",
        inner: true
    },
    {
        id: 38,
        x: "32%",
        y: "60.5%",
        category: "Python",
        inner: true
    },
    {
        id: 39,
        x: "40%",
        y: "56%",
        category: "JavaScript",
        inner: true
    },


    // JavaScript path.
    {
        id: 40,
        x: "24%",
        y: "35%",
        category: "JavaScript",
        inner: true
    },
    {
        id: 41,
        x: "32%",
        y: "39.5%",
        category: "C#",
        inner: true
    },
    {
        id: 42,
        x: "40%",
        y: "44%",
        category: "Java",
        inner: true
    }
];


// =====================================
// CSS custom-property style
// =====================================

type BoardSpaceStyle = CSSProperties & {
    "--x": string;
    "--y": string;
    "--space-color"?: string;
};

type PlayerPieceStyle = CSSProperties & {
    "--x": string;
    "--y": string;
    "--player-offset-x": string;
    "--player-offset-y": string;
};

function getBoardPosition(
    boardSpaceId: number
): {
    x: string;
    y: string;
} {
    if (boardSpaceId === 43) {
        return {
            x: "50%",
            y: "50%"
        };
    }

    const space = boardSpaces.find(
        boardSpace =>
            boardSpace.id === boardSpaceId
    );

    if (!space) {
        return {
            x: "50%",
            y: "50%"
        };
    }

    return {
        x: space.x,
        y: space.y
    };
}


// =====================================
// Game board
// =====================================

function GameBoard({
    legalDestinationIds,
    players,
    currentPlayerNumber,
    onMove
}: GameBoardProps) {

    const isCenterLegal =
        legalDestinationIds.includes(43);


    return (
        <section
            className="gameplay-board-panel"
            aria-labelledby="interactive-board-heading"
        >

            <h2 id="interactive-board-heading">
                Interactive Board
            </h2>

            <p className="text-muted">
                Roll the dice to see where you can move.
            </p>


            {/* =====================================
                Category legend

                Category names are included as text
                so the board does not rely on color alone.
                ===================================== */}

            <div
                className="board-key"
                aria-label="Board category legend"
            >
                {(
                    Object.entries(categoryColors) as [
                        Category,
                        string
                    ][]
                ).map(([category, color]) => (
                    <span
                        className="board-key-item"
                        key={category}
                    >
                        <span
                            className="board-key-color"
                            style={{
                                backgroundColor: color
                            }}
                            aria-hidden="true"
                        />

                        {category}
                    </span>
                ))}
            </div>


            {/* =====================================
                Circular game board
                ===================================== */}

            <div className="interactive-board-shell">

                <div
                    className="interactive-board"
                    role="group"
                    aria-label="Code Pursuit interactive game board"
                >

                    {/* Category labels. */}

                    <span
                        className="
                            board-category-label
                            board-category-history
                        "
                    >
                        Game
                        <br />
                        History
                    </span>

                    <span
                        className="
                            board-category-label
                            board-category-java
                        "
                    >
                        Java
                    </span>

                    <span
                        className="
                            board-category-label
                            board-category-python
                        "
                    >
                        Python
                    </span>

                    <span
                        className="
                            board-category-label
                            board-category-csharp
                        "
                    >
                        C#
                    </span>

                    <span
                        className="
                            board-category-label
                            board-category-html
                        "
                    >
                        HTML/CSS
                    </span>

                    <span
                        className="
                            board-category-label
                            board-category-javascript
                        "
                    >
                        JavaScript
                    </span>


                    {/* =====================================
                        Spaces 1-42
                        ===================================== */}

                    {boardSpaces.map((space) => {

                        const isLegalDestination =
                            legalDestinationIds.includes(
                                space.id
                            );


                        const style: BoardSpaceStyle = {
                            "--x": space.x,
                            "--y": space.y
                        };


                        if (space.category) {
                            style["--space-color"] =
                                categoryColors[
                                    space.category
                                ];
                        }


                        const classNames = [
                            "board-space",

                            space.inner
                                ? "inner-space"
                                : "",

                            space.rollAgain
                                ? "roll-again"
                                : "",

                            isLegalDestination
                                ? "legal-destination"
                                : ""
                        ]
                            .filter(Boolean)
                            .join(" ");


                        const accessibleName =
                            isLegalDestination
                                ? space.rollAgain
                                    ? `Move to board space ${space.id}, Roll Again`
                                    : `Move to board space ${space.id}, ${space.category}`
                                : space.rollAgain
                                    ? `Board space ${space.id}, Roll Again`
                                    : `Board space ${space.id}, ${space.category}`;


                        return (
                            <button
                                key={space.id}
                                type="button"
                                className={classNames}
                                style={style}
                                disabled={
                                    !isLegalDestination
                                }
                                onClick={() =>
                                    onMove(space.id)
                                }
                                aria-label={
                                    accessibleName
                                }
                            >
                                {space.rollAgain ? (
                                    <span className="roll-again-text">
                                        ROLL
                                    </span>
                                ) : (
                                    <span
                                        className="board-space-marker"
                                        aria-hidden="true"
                                    />
                                )}
                            </button>
                        );
                    })}


                    {/* =====================================
                        Center - space 43
                        ===================================== */}

                    <button
                        type="button"
                        className={[
                            "board-center",
                            isCenterLegal
                                ? "legal-destination"
                                : ""
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        disabled={!isCenterLegal}
                        onClick={() =>
                            onMove(43)
                        }
                        aria-label={
                            isCenterLegal
                                ? "Move to board space 43, center of the board"
                                : "Board space 43, center of the board"
                        }
                    />

                    {/* =====================================
                        Player pieces
                        ===================================== */}

                    <div
                        className="board-player-pieces"
                        aria-label="Player positions"
                    >
                        {players.map((player) => {

                            const position =
                                getBoardPosition(
                                    player.boardSpaceId
                                );

                            const playersOnSameSpace =
                                players.filter(
                                    otherPlayer =>
                                        otherPlayer.boardSpaceId ===
                                        player.boardSpaceId
                                );

                            const positionOnSpace =
                                playersOnSameSpace.findIndex(
                                    otherPlayer =>
                                        otherPlayer.playerNumber ===
                                        player.playerNumber
                                );


                            const offsets = [
                                { x: "0px", y: "0px" },
                                { x: "18px", y: "-12px" },
                                { x: "-18px", y: "-12px" },
                                { x: "18px", y: "12px" },
                                { x: "-18px", y: "12px" },
                                { x: "0px", y: "20px" }
                            ];

                            const offset = offsets[positionOnSpace] ?? {
                                x: "0px",
                                y: "0px"
                            };


                            const style: PlayerPieceStyle = {
                                "--x": position.x,
                                "--y": position.y,
                                "--player-offset-x":
                                    offset.x,
                                "--player-offset-y":
                                    offset.y
                            };


                            const isCurrentPlayer =
                                player.playerNumber ===
                                currentPlayerNumber;


                            return (
                                <div
                                    key={player.playerNumber}
                                    className={[
                                        "board-player-piece",
                                        isCurrentPlayer
                                            ? "current-board-player"
                                            : ""
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    style={style}
                                    aria-label={
                                        `${player.playerName}, ` +
                                        `Player ${player.playerNumber}, ` +
                                        `board space ${player.boardSpaceId}` +
                                        (
                                            isCurrentPlayer
                                                ? ", current player"
                                                : ""
                                        )
                                    }
                                >
                                    <span aria-hidden="true">
                                        {player.playerNumber}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                </div>

            </div>

        </section>
    );
}


export default GameBoard;