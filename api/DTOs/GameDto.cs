using HMJT.Models;

namespace HMJT.DTOs;

public class GameDto
{
    public int GameId { get; set; }
    public string Name { get; set; } = string.Empty;
    public GameStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string OwnerUserId { get; set; } =
        string.Empty;
    public ICollection<Question> Questions { get; set; } =
        new List<Question>();
    public ICollection<PresetQuestion> PresetQuestions { get; set; } =
        new List<PresetQuestion>();
    public int TimesPlayed { get; set; }
}
