
using HMJT.Models;

namespace HMJT.DTOs;


// Represents a question returned by the API to the frontend.

public class QuestionDto
{
    public int QuestionId { get; set; }

    public string QuestionText { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public Difficulty Difficulty { get; set; }

    public string AnswerA { get; set; } = string.Empty;
    public string AnswerB { get; set; } = string.Empty;
    public string AnswerC { get; set; } = string.Empty;
    public string AnswerD { get; set; } = string.Empty;

    public AnswerOption CorrectAnswer { get; set; }

    public int GameId { get; set; }

    // Name of the game associated with the question.
    public string? GameName { get; set; }
}
