
using System.ComponentModel.DataAnnotations;
using HMJT.Models;

namespace HMJT.DTOs;

// Represents the data required to create a new question.

public class CreateQuestionDto
{
    // Question text is required and cannot exceed 500 characters.
    [Required(ErrorMessage = "Question text is required.")]
    [StringLength(500, ErrorMessage = "Question text cannot exceed 500 characters.")]
    public string QuestionText { get; set; } = string.Empty;

    // Category is required and cannot exceed 100 characters.
    [Required(ErrorMessage = "Category is required.")]
    [StringLength(100, ErrorMessage = "Category cannot exceed 100 characters.")]
    public string Category { get; set; } = string.Empty;

    // The difficulty must be a defined Difficulty enum value.
    [EnumDataType(typeof(Difficulty), ErrorMessage = "Invalid difficulty level.")]
    public Difficulty Difficulty { get; set; }

    // Each answer is required and cannot exceed 300 characters.
    [Required(ErrorMessage = "Answer A is required.")]
    [StringLength(300, ErrorMessage = "Answer A cannot exceed 300 characters.")]
    public string AnswerA { get; set; } = string.Empty;

    [Required(ErrorMessage = "Answer B is required.")]
    [StringLength(300, ErrorMessage = "Answer B cannot exceed 300 characters.")]
    public string AnswerB { get; set; } = string.Empty;

    [Required(ErrorMessage = "Answer C is required.")]
    [StringLength(300, ErrorMessage = "Answer C cannot exceed 300 characters.")]
    public string AnswerC { get; set; } = string.Empty;

    [Required(ErrorMessage = "Answer D is required.")]
    [StringLength(300, ErrorMessage = "Answer D cannot exceed 300 characters.")]
    public string AnswerD { get; set; } = string.Empty;

    // The correct answer must be a defined AnswerOption enum value.
    [EnumDataType(typeof(AnswerOption), ErrorMessage = "Invalid correct answer option.")]
    public AnswerOption CorrectAnswer { get; set; }

    // A valid game must be selected.
    [Range(1, int.MaxValue, ErrorMessage = "Please select a game.")]
    public int GameId { get; set; }
}
