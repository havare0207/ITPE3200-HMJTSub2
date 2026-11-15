using System.ComponentModel.DataAnnotations;

namespace HMJT.DTOs.Gameplay;

public class RollDiceRequestDto
{
    [Required]
    public Guid GameSessionId { get; set; }


    [Range(1, 6)]
    public int CurrentPlayerNumber { get; set; }
}