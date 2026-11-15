namespace HMJT.DTOs.Gameplay;

public class GameStateDto
{
    // Unique identifier for this local game session.
    public Guid GameSessionId { get; set; }


    // Selected difficulty for the entire game.
    public string Difficulty { get; set; } = string.Empty;


    // Standard or Custom.
    public string GameMode { get; set; } = string.Empty;


    // All players participating in the game.
    public List<GamePlayerStateDto> Players { get; set; } = new();


    // Player whose turn it currently is.
    public int CurrentPlayerNumber { get; set; }


    // The game starts before the first dice roll.
    public bool CanRollDice { get; set; } = true;


    // No dice has been rolled yet.
    public int? DiceRoll { get; set; }


    // The player is not waiting to move yet.
    public bool IsWaitingForMove { get; set; }

    // Board spaces the current player may move to
    // after the dice has been rolled.
    public List<int> LegalDestinationIds { get; set; } = new();


    // The game has not ended when it starts.
    public bool IsGameOver { get; set; }


    // Winner is empty until the game has ended.
    public string? WinnerName { get; set; }


    // General gameplay feedback shown in the UI.
    public string Message { get; set; } = string.Empty;
}


public class GamePlayerStateDto
{
    public int PlayerNumber { get; set; }

    public string PlayerName { get; set; } = string.Empty;


    // All players initially start in the center.
    // We are using board space 43 as the center,
    // matching the Subapp 1 board.
    public int BoardSpaceId { get; set; } = 43;


    // Category wedges collected by this player.
    public List<string> Wedges { get; set; } = new();
}