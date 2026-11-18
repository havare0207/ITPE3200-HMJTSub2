using System.ComponentModel.DataAnnotations;

namespace HMJT.DTOs.Gameplay;

public class AnswerQuestionRequestDto
{
    [Required]
    public Guid GameSessionId { get; set; }

    [Range(1, 6)]
    public int CurrentPlayerNumber { get; set; }

    [Range(1, int.MaxValue)]
    public int QuestionId { get; set; }

    [Required]
    [RegularExpression(
        "^[A-Da-d]$",
        ErrorMessage = "Selected answer must be A, B, C or D."
    )]
    public string SelectedAnswer { get; set; } =
        string.Empty;
}