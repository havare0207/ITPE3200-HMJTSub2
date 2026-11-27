namespace HMJT.Models;

// Represents a question stored in an active gameplay session.
// Supports both custom questions and preset questions.
public class GameplayQuestion
{
    public int QuestionId { get; set; }

    public string Category { get; set; } = string.Empty;

    public string QuestionText { get; set; } = string.Empty;

    public Difficulty Difficulty { get; set; }

    public string AnswerA { get; set; } = string.Empty;

    public string AnswerB { get; set; } = string.Empty;

    public string AnswerC { get; set; } = string.Empty;

    public string AnswerD { get; set; } = string.Empty;

    public AnswerOption CorrectAnswer { get; set; }

    // Identifies whether the question originates
    // from the preset question collection.
    public bool IsPresetQuestion { get; set; }
}