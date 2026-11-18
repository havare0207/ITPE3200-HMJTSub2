using System.ComponentModel.DataAnnotations;

namespace HMJT.DTOs.Gameplay;

public class ConfirmStartGameRequestDto
{
    [Required]
    public string GameMode { get; set; } = string.Empty;


    [Required]
    public string Difficulty { get; set; } = string.Empty;


    [Required]
    [MinLength(2)]
    [MaxLength(6)]
    public List<GamePlayerDto> Players { get; set; } = new();


    [Range(1, 6)]
    public int StartingPlayerNumber { get; set; }
}