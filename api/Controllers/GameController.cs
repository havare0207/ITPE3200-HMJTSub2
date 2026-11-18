using System.Security.Claims;
using HMJT.DAL;
using HMJT.DTOs;
using HMJT.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HMJT.Controllers;

[Authorize]
[ApiController]
[Route("api/games")]

public class GameController : ControllerBase
{
    private readonly IGameRepository _gameRepository;
    private readonly ILogger<GameController> _logger;

    public GameController(
        IGameRepository gameRepository,
        ILogger<GameController> logger)
    {
        _gameRepository = gameRepository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameDto>>> GetGames()
    {
        string? userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        IEnumerable<Game> games = await _gameRepository.GetAllForUser(userId);
        IEnumerable<GameDto> gameDtos = games.Select(ToDto);

        return Ok(gameDtos);
        }

        [HttpGet("{id:int}")]
    public async Task<ActionResult<GameDto>> GetGame(int id)
    {
        string? userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        Game? game = await _gameRepository.GetByIdForUser(id, userId);

        if (game == null)
        {
            _logger.LogWarning(
                "Game not found or access denied for game ID: {GameId}", id);

            return NotFound();
        }

        return Ok(ToDto(game));
    }

    [HttpPost]
    public async Task<ActionResult<GameDto>> CreateGame(
        [FromBody] CreateGameDto createGameDto)
    {
        string? userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var game = new Game
        {
            Name = createGameDto.Name,
            OwnerUserId = userId,
            CreatedAt = DateTime.UtcNow,
            Status = GameStatus.NotStarted
        };

        try
        {
            await _gameRepository.Create(game);

            _logger.LogInformation(
                "Game '{Name}' created with ID {GameId}.",
                game.Name, game.GameId);

            return CreatedAtAction(
                nameof(GetGame), new { id = game.GameId }, ToDto(game));
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error creating game.");

            return StatusCode(500, new
            {
                message = "An error occurred while creating the game. Please try again."
            });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<GameDto>> UpdateGame(
        int id, [FromBody] UpdateGameDto updateGameDto)
    {
        string? userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        Game? existingGame = await _gameRepository.GetByIdForUser(id, userId);

        if (existingGame == null)
        {
            _logger.LogWarning(
                "Game not found or access denied for game ID: {GameId}", id);

            return NotFound();
        }

        try
        {
            existingGame.Name = updateGameDto.Name;

            await _gameRepository.Update(existingGame);

            _logger.LogInformation("Game '{Name}' updated.", existingGame.Name);

            return Ok(ToDto(existingGame));
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error editing game.");

            return StatusCode(500, new
            {
                message = "An error occurred while editing the game. Please try again."
            });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteGame(int id)
    {
        string? userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        try
        {
            bool deleted = await _gameRepository.Delete(id, userId);

            if (!deleted)
            {
                _logger.LogWarning(
                    "Game not found or access denied for game ID: {GameId}", id);

                return NotFound();
            }

            _logger.LogInformation("Game with ID {GameId} deleted.", id);

            return NoContent();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error deleting game.");

            return StatusCode(500, new
            {
                message = "An error occurred while deleting the game. Please try again."
            });
        }
    }

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    private static GameDto ToDto(Game game)
    {
        return new GameDto
        {
            GameId = game.GameId,
            Name = game.Name,
            Status = game.Status,
            CreatedAt = game.CreatedAt,
            TimesPlayed = game.TimesPlayed
        };
    }
}

