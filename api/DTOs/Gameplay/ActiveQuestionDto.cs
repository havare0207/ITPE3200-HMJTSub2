namespace HMJT.DTOs.Gameplay;

public class ActiveQuestionDto
{
    public int QuestionId { get; set; }

    public string Category { get; set; } = string.Empty;

    public string QuestionText { get; set; } = string.Empty;

    public string AnswerA { get; set; } = string.Empty;

    public string AnswerB { get; set; } = string.Empty;

    public string AnswerC { get; set; } = string.Empty;

    public string AnswerD { get; set; } = string.Empty;
}