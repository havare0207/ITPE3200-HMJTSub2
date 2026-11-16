// =====================================
// Wedge token
// =====================================

interface WedgeTokenProps {
    wedges: string[];

    size?: "small" | "board";

    playerNumber?: number;

    ariaLabel?: string;
}


function WedgeToken({
    wedges,
    size = "small",
    playerNumber,
    ariaLabel
}: WedgeTokenProps) {

    // =====================================
    // Collected wedge classes
    // =====================================

    const classes = [
        "wedge-token"
    ];


    if (size === "small") {
        classes.push(
            "wedge-token-small"
        );
    }


    if (size === "board") {
        classes.push(
            "board-wedge-token"
        );
    }


    if (
        wedges.some(
            (wedge) =>
                wedge.toLowerCase() === "java"
        )
    ) {
        classes.push(
            "has-java"
        );
    }


    if (
        wedges.some(
            (wedge) =>
                wedge.toLowerCase() === "python"
        )
    ) {
        classes.push(
            "has-python"
        );
    }


    if (
        wedges.some(
            (wedge) =>
                wedge.toLowerCase() === "c#"
        )
    ) {
        classes.push(
            "has-csharp"
        );
    }


    if (
        wedges.some(
            (wedge) =>
                wedge.toLowerCase() === "html/css"
        )
    ) {
        classes.push(
            "has-html"
        );
    }


    if (
        wedges.some(
            (wedge) =>
                wedge.toLowerCase() ===
                "game history"
        )
    ) {
        classes.push(
            "has-history"
        );
    }


    if (
        wedges.some(
            (wedge) =>
                wedge.toLowerCase() ===
                "javascript"
        )
    ) {
        classes.push(
            "has-javascript"
        );
    }


    return (
        <div
            className={classes.join(" ")}
            role={
                ariaLabel
                    ? "img"
                    : undefined
            }
            aria-label={ariaLabel}
            aria-hidden={
                ariaLabel
                    ? undefined
                    : true
            }
        >
            {playerNumber !== undefined && (
                <span
                    className="board-player-number"
                    aria-hidden="true"
                >
                    {playerNumber}
                </span>
            )}
        </div>
    );
}


export default WedgeToken;