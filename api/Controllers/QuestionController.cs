using System.Security.Claims;
using HMJT.DAL;
using HMJT.DTOs;
using HMJT.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HMJT.Controllers;

//[Authorize]
[ApiController]
[Route("api/questions")]
public class QuestionController : ControllerBase
{
    private readonly IQuestionRepository _questionRepository;
    private readonly IGameRepository _gameRepository;
    private readonly ILogger<QuestionController> _logger;

    public QuestionController(
        IQuestionRepository questionRepository,
        IGameRepository gameRepository,
        ILogger<QuestionController> logger)
    {
        _questionRepository = questionRepository;
        _gameRepository = gameRepository;
        _logger = logger;
    }

    // Gets all questions belonging to the logged-in user.
    // Supports searching and filtering.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuestionDto>>> GetQuestions(
        [FromQuery] string? searchString,
        [FromQuery] string? category,
        [FromQuery] Difficulty? difficulty,
        [FromQuery] int? gameId)
    {
        string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        // Reject undefined numeric enum values in the query string.
        if (difficulty.HasValue &&
            !Enum.IsDefined(typeof(Difficulty), difficulty.Value))
        {
            return BadRequest("Invalid difficulty level.");
        }

        var questions = await _questionRepository.GetAll();

        // Only return questions belonging to the current user.
        var result = questions.Where(q =>
            q.Game != null && q.Game.OwnerUserId == userId);

        // Search by question text.
        if (!string.IsNullOrWhiteSpace(searchString))
        {
            result = result.Where(q =>
                q.QuestionText.Contains(
                    searchString,
                    StringComparison.OrdinalIgnoreCase));
        }

        // Filter by category.
        if (!string.IsNullOrWhiteSpace(category))
        {
            result = result.Where(q =>
                q.Category.Equals(
                    category,
                    StringComparison.OrdinalIgnoreCase));
        }

        // Filter by difficulty.
        if (difficulty.HasValue)
        {
            result = result.Where(q =>
                q.Difficulty == difficulty.Value);
        }

        // Filter by game.
        if (gameId.HasValue)
        {
            result = result.Where(q => q.GameId == gameId.Value);
        }

        var questionDtos = result
            .Select(q => ToDto(q))
            .ToList();

        return Ok(questionDtos);
    }

    // Gets one question if it belongs to the logged-in user.
    [HttpGet("{id:int}")]
    public async Task<ActionResult<QuestionDto>> GetQuestion(int id)
    {
        string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var question = await _questionRepository.GetQuestionById(id);

        if (question == null)
        {
            return NotFound();
        }

        // Verify that the associated game belongs to this user.
        var game = await _gameRepository.GetByIdForUser(
            question.GameId, userId);

        if (game == null)
        {
            return NotFound();
        }

        var questionDto = ToDto(question);
        questionDto.GameName = game.Name;

     return Ok(questionDto);
    }

    // Creates a question for a game owned by the logged-in user.
    [HttpPost]
    public async Task<ActionResult<QuestionDto>> CreateQuestion(
        [FromBody] CreateQuestionDto dto)
    {
        string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        // Verify that the selected game belongs to this user.
        var game = await _gameRepository.GetByIdForUser(
            dto.GameId, userId);

        if (game == null)
        {
            return BadRequest(
                "The selected game does not exist or does not belong to you.");
        }

        var question = new Question
        {
            QuestionText = dto.QuestionText,
            Category = dto.Category,
            Difficulty = dto.Difficulty,
            AnswerA = dto.AnswerA,
            AnswerB = dto.AnswerB,
            AnswerC = dto.AnswerC,
            AnswerD = dto.AnswerD,
            CorrectAnswer = dto.CorrectAnswer,
            GameId = dto.GameId
        };

        await _questionRepository.Create(question);

        _logger.LogInformation(
            "Question {QuestionId} was created by user {UserId}.",
            question.QuestionId, userId);

        var questionDto = ToDto(question);
        questionDto.GameName = game.Name;

        return CreatedAtAction(
            nameof(GetQuestion),
            new { id = question.QuestionId },
            questionDto);
    }

    // Updates a question without allowing its game association to change.
    [HttpPut("{id:int}")]
    public async Task<ActionResult<QuestionDto>> UpdateQuestion(
        int id,
        [FromBody] UpdateQuestionDto dto)
    {
        string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var question = await _questionRepository.GetQuestionById(id);

        if (question == null)
        {
            return NotFound();
        }

        // Check ownership using the existing GameId.
        var game = await _gameRepository.GetByIdForUser(
            question.GameId, userId);

        if (game == null)
        {
            return NotFound();
        }

        // Update the editable properties.
        // GameId remains unchanged.
        question.QuestionText = dto.QuestionText;
        question.Category = dto.Category;
        question.Difficulty = dto.Difficulty;
        question.AnswerA = dto.AnswerA;
        question.AnswerB = dto.AnswerB;
        question.AnswerC = dto.AnswerC;
        question.AnswerD = dto.AnswerD;
        question.CorrectAnswer = dto.CorrectAnswer;

        await _questionRepository.Update(question);

        _logger.LogInformation(
            "Question {QuestionId} was updated by user {UserId}.",
            id, userId);

        var questionDto = ToDto(question);
        questionDto.GameName = game.Name;

        return Ok(questionDto);
    }

    // Deletes a question if it belongs to the logged-in user.
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteQuestion(int id)
    {
        string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var question = await _questionRepository.GetQuestionById(id);

        if (question == null)
        {
            return NotFound();
        }

        // Verify ownership before deleting.
        var game = await _gameRepository.GetByIdForUser(
            question.GameId, userId);

        if (game == null)
        {
            return NotFound();
        }

        bool deleted = await _questionRepository.Delete(id);

        if (!deleted)
        {
            return NotFound();
        }

        _logger.LogInformation(
            "Question {QuestionId} was deleted by user {UserId}.",
            id, userId);

        return NoContent();
    }

    // Converts a Question model into a QuestionDto.
    private static QuestionDto ToDto(Question question)
    {
        return new QuestionDto
        {
            QuestionId = question.QuestionId,
            QuestionText = question.QuestionText,
            Category = question.Category,
            Difficulty = question.Difficulty,
            AnswerA = question.AnswerA,
            AnswerB = question.AnswerB,
            AnswerC = question.AnswerC,
            AnswerD = question.AnswerD,
            CorrectAnswer = question.CorrectAnswer,
            GameId = question.GameId,
            GameName = question.Game?.Name
        };
    }
}
