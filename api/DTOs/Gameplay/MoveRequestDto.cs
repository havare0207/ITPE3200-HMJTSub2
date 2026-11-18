using System.ComponentModel.DataAnnotations;

namespace HMJT.DTOs.Gameplay;

public class MoveRequestDto
{
    [Required]
    public Guid GameSessionId { get; set; }


    [Range(1, 6)]
    public int CurrentPlayerNumber { get; set; }


    [Range(1, 43)]
    public int BoardSpaceId { get; set; }
}