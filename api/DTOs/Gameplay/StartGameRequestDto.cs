using System.ComponentModel.DataAnnotations;

namespace HMJT.DTOs.Gameplay;

public class StartGameRequestDto
{
    // Standard or Custom.
    [Required]
    public string GameMode { get; set; } = string.Empty;


    // Easy, Medium or Hard.
    [Required]
    public string Difficulty { get; set; } = string.Empty;


    // A Code Pursuit game requires between 2 and 6 players.
    [Required]
    [MinLength(2)]
    [MaxLength(6)]
    public List<string> PlayerNames { get; set; } = new();


    // Used only when GameMode is Custom.
    public int? CustomGameId { get; set; }
}