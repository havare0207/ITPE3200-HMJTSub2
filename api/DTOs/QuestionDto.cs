
using HMJT.Models;

namespace HMJT.DTOs;


// Represents a question returned by the API to the frontend.

public class QuestionDto
{
    // Unique ID of the question.
    public int QuestionId { get; set; }

    // The text of the question.
    public string QuestionText { get; set; } = string.Empty;

    // The category the question belongs to.
    public string Category { get; set; } = string.Empty;

    // The difficulty level: Easy, Medium or Hard.
    public Difficulty Difficulty { get; set; }

    // The four possible answers.
    public string AnswerA { get; set; } = string.Empty;
    public string AnswerB { get; set; } = string.Empty;
    public string AnswerC { get; set; } = string.Empty;
    public string AnswerD { get; set; } = string.Empty;

    // Identifies the correct answer: A, B, C or D.
    public AnswerOption CorrectAnswer { get; set; }

    // ID of the game this question belongs to.
    public int GameId { get; set; }

    // Name of the associated game.
    public string? GameName { get; set; }
}
