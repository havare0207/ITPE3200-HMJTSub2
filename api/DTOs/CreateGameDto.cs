using System.ComponentModel.DataAnnotations;
using HMJT.Models;

namespace HMJT.DTOs;

public class CreateGameDto
{
    [Required(ErrorMessage = "Please enter a game name.")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Game name must be between 2 and 50 characters.")]
    public string Name { get; set; } = string.Empty;
}