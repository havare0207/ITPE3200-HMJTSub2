using System.ComponentModel.DataAnnotations;

namespace HMJT.DTOs.Gameplay;

public class SelectCenterCategoryRequestDto
{
    [Required]
    public Guid GameSessionId { get; set; }

    [Range(1, 6)]
    public int CurrentPlayerNumber { get; set; }

    [Required]
    public string Category { get; set; } =
        string.Empty;
}