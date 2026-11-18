namespace HMJT.DTOs.Gameplay;

public class StartGameResponseDto
{
    public string GameMode { get; set; } = string.Empty;

    public string Difficulty { get; set; } = string.Empty;

    public List<GamePlayerDto> Players { get; set; } = new();

    public int StartingPlayerNumber { get; set; }

    public string StartingPlayerName { get; set; } = string.Empty;
}


public class GamePlayerDto
{
    public int PlayerNumber { get; set; }

    public string PlayerName { get; set; } = string.Empty;
}