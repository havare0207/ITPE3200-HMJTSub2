using HMJT.DTOs.Gameplay;
using HMJT.Models;
using HMJT.Services;
using Microsoft.AspNetCore.Mvc;

namespace HMJT.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameplayController : ControllerBase
{
    private readonly ILogger<GameplayController> _logger;
    private readonly GameplaySessionService _gameplaySessionService;
    private readonly BoardService _boardService;


    public GameplayController(
        ILogger<GameplayController> logger,
        GameplaySessionService gameplaySessionService,
        BoardService boardService)
    {
        _logger = logger;
        _gameplaySessionService = gameplaySessionService;
        _boardService = boardService;
    }


    // =====================================
    // Start a new Code Pursuit game
    // =====================================

    [HttpPost("start")]
    public ActionResult<StartGameResponseDto> StartGame(
        [FromBody] StartGameRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }


        // Remove whitespace and empty player names.
        List<string> playerNames =
            request.PlayerNames
                .Select(name => name.Trim())
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .ToList();


        // Code Pursuit requires between 2 and 6 players.
        if (
            playerNames.Count < 2 ||
            playerNames.Count > 6
        )
        {
            return BadRequest(new
            {
                message =
                    "A game must have between 2 and 6 players."
            });
        }


        // Player names must be unique.
        bool hasDuplicateNames =
            playerNames
                .Distinct(
                    StringComparer.OrdinalIgnoreCase
                )
                .Count() != playerNames.Count;

        if (hasDuplicateNames)
        {
            return BadRequest(new
            {
                message =
                    "Each player must have a unique name."
            });
        }


        // Validate the selected difficulty.
        string[] validDifficulties =
        {
            "Easy",
            "Medium",
            "Hard"
        };

        if (
            !validDifficulties.Contains(
                request.Difficulty,
                StringComparer.OrdinalIgnoreCase
            )
        )
        {
            return BadRequest(new
            {
                message =
                    "Difficulty must be Easy, Medium or Hard."
            });
        }


        // Validate the selected game mode.
        string[] validGameModes =
        {
            "Standard",
            "Custom"
        };

        if (
            !validGameModes.Contains(
                request.GameMode,
                StringComparer.OrdinalIgnoreCase
            )
        )
        {
            return BadRequest(new
            {
                message =
                    "Game mode must be Standard or Custom."
            });
        }


        // A custom game must include a custom game ID.
        if (
            request.GameMode.Equals(
                "Custom",
                StringComparison.OrdinalIgnoreCase
            ) &&
            request.CustomGameId is null
        )
        {
            return BadRequest(new
            {
                message =
                    "A custom game must be selected."
            });
        }


        // Convert the player names into response DTOs.
        List<GamePlayerDto> players =
            playerNames
                .Select(
                    (name, index) =>
                        new GamePlayerDto
                        {
                            PlayerNumber =
                                index + 1,

                            PlayerName =
                                name
                        }
                )
                .ToList();


        // Randomly select the starting player.
        int startingPlayerIndex =
            Random.Shared.Next(
                players.Count
            );

        GamePlayerDto startingPlayer =
            players[startingPlayerIndex];


        _logger.LogInformation(
            "Started {GameMode} game with {PlayerCount} players. " +
            "{StartingPlayer} was selected as starting player.",
            request.GameMode,
            players.Count,
            startingPlayer.PlayerName
        );


        StartGameResponseDto response =
            new()
            {
                GameMode =
                    request.GameMode,

                Difficulty =
                    request.Difficulty,

                Players =
                    players,

                StartingPlayerNumber =
                    startingPlayer.PlayerNumber,

                StartingPlayerName =
                    startingPlayer.PlayerName
            };


        return Ok(response);
    }


    // =====================================
    // Confirm the selected starting player
    // and create the initial game state
    // =====================================

    [HttpPost("confirm")]
    public ActionResult<GameStateDto> ConfirmStartGame(
        [FromBody] ConfirmStartGameRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }


        // Validate the selected difficulty.
        string[] validDifficulties =
        {
            "Easy",
            "Medium",
            "Hard"
        };

        if (
            !validDifficulties.Contains(
                request.Difficulty,
                StringComparer.OrdinalIgnoreCase
            )
        )
        {
            return BadRequest(new
            {
                message =
                    "Difficulty must be Easy, Medium or Hard."
            });
        }


        // Validate the selected game mode.
        string[] validGameModes =
        {
            "Standard",
            "Custom"
        };

        if (
            !validGameModes.Contains(
                request.GameMode,
                StringComparer.OrdinalIgnoreCase
            )
        )
        {
            return BadRequest(new
            {
                message =
                    "Game mode must be Standard or Custom."
            });
        }


        // Confirm that the starting player exists
        // in the submitted player list.
        GamePlayerDto? startingPlayer =
            request.Players.FirstOrDefault(
                player =>
                    player.PlayerNumber ==
                    request.StartingPlayerNumber
            );

        if (startingPlayer is null)
        {
            return BadRequest(new
            {
                message =
                    "The selected starting player does not exist."
            });
        }


        // Convert the setup players into active game players.
        List<GamePlayerStateDto> players =
            request.Players
                .Select(
                    player =>
                        new GamePlayerStateDto
                        {
                            PlayerNumber =
                                player.PlayerNumber,

                            PlayerName =
                                player.PlayerName,

                            // All players begin in the center.
                            BoardSpaceId =
                                43,

                            Wedges =
                                new List<string>()
                        }
                )
                .ToList();


        // Create the initial active game state.
        GameStateDto gameState =
            new()
            {
                GameSessionId =
                    Guid.NewGuid(),

                GameMode =
                    request.GameMode,

                Difficulty =
                    request.Difficulty,

                Players =
                    players,

                CurrentPlayerNumber =
                    request.StartingPlayerNumber,

                CanRollDice =
                    true,

                DiceRoll =
                    null,

                IsWaitingForMove =
                    false,

                LegalDestinationIds =
                    new List<int>(),

                IsGameOver =
                    false,

                WinnerName =
                    null,

                Message =
                    $"{startingPlayer.PlayerName} starts the game."
            };


        // Store the active game so later requests
        // can retrieve it by GameSessionId.
        bool gameStored =
            _gameplaySessionService.AddGame(
                gameState
            );

        if (!gameStored)
        {
            _logger.LogError(
                "Unable to store game session {GameSessionId}.",
                gameState.GameSessionId
            );

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "Unable to create the game session."
                }
            );
        }


        _logger.LogInformation(
            "Game session {GameSessionId} confirmed. " +
            "{StartingPlayer} starts the game.",
            gameState.GameSessionId,
            startingPlayer.PlayerName
        );


        return Ok(gameState);
    }


    // =====================================
    // Roll the dice for the current player
    // =====================================

    [HttpPost("roll-dice")]
    public ActionResult<GameStateDto> RollDice(
        [FromBody] RollDiceRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }


        // Find the active game session.
        GameStateDto? gameState =
            _gameplaySessionService.GetGame(
                request.GameSessionId
            );

        if (gameState is null)
        {
            return NotFound(new
            {
                message =
                    "The game session could not be found."
            });
        }


        // The game cannot continue after a winner
        // has been declared.
        if (gameState.IsGameOver)
        {
            return BadRequest(new
            {
                message =
                    "The game has already ended."
            });
        }


        // Prevent another player from rolling
        // during the current player's turn.
        if (
            request.CurrentPlayerNumber !=
            gameState.CurrentPlayerNumber
        )
        {
            return BadRequest(new
            {
                message =
                    "It is not this player's turn."
            });
        }


        // A player may only roll once before
        // completing the movement step.
        if (!gameState.CanRollDice)
        {
            return BadRequest(new
            {
                message =
                    "The dice cannot be rolled right now."
            });
        }


        // Find the player whose turn it currently is.
        GamePlayerStateDto? currentPlayer =
            gameState.Players.FirstOrDefault(
                player =>
                    player.PlayerNumber ==
                    gameState.CurrentPlayerNumber
            );

        if (currentPlayer is null)
        {
            _logger.LogError(
                "Current player {PlayerNumber} was not found " +
                "in game session {GameSessionId}.",
                gameState.CurrentPlayerNumber,
                gameState.GameSessionId
            );

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "The current player could not be found."
                }
            );
        }


        // Roll a standard six-sided die.
        int diceRoll =
            Random.Shared.Next(
                1,
                7
            );


        // Calculate every legal destination
        // for the current player's position
        // and the rolled number.
        List<BoardSpace> legalDestinations =
            _boardService.GetLegalDestinations(
                currentPlayer.BoardSpaceId,
                diceRoll
            );


        // Update the active game state.
        gameState.DiceRoll =
            diceRoll;

        gameState.CanRollDice =
            false;

        gameState.IsWaitingForMove =
            true;

        gameState.LegalDestinationIds =
            legalDestinations
                .Select(
                    space =>
                        space.BoardSpaceId
                )
                .ToList();

        gameState.Message =
            $"{currentPlayer.PlayerName} rolled {diceRoll}. " +
            "Choose a space to move to.";


        // Store the updated game state.
        bool updated =
            _gameplaySessionService.UpdateGame(
                gameState
            );

        if (!updated)
        {
            _logger.LogError(
                "Unable to update game session {GameSessionId}.",
                gameState.GameSessionId
            );

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "Unable to update the game session."
                }
            );
        }


        _logger.LogInformation(
            "Player {PlayerNumber} rolled {DiceRoll} " +
            "in game session {GameSessionId}.",
            currentPlayer.PlayerNumber,
            diceRoll,
            gameState.GameSessionId
        );


        return Ok(gameState);
    }

    // =====================================
    // Move the current player
    // =====================================

    [HttpPost("move")]
    public ActionResult<GameStateDto> Move(
        [FromBody] MoveRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }


        // Find the active game session.
        GameStateDto? gameState =
            _gameplaySessionService.GetGame(
                request.GameSessionId
            );

        if (gameState is null)
        {
            return NotFound(new
            {
                message =
                    "The game session could not be found."
            });
        }


        // Movement is only allowed while the game
        // is waiting for the current player to move.
        if (!gameState.IsWaitingForMove)
        {
            return BadRequest(new
            {
                message =
                    "The game is not waiting for a move."
            });
        }


        // Make sure the submitted player is
        // the player whose turn it currently is.
        if (
            request.CurrentPlayerNumber !=
            gameState.CurrentPlayerNumber
        )
        {
            return BadRequest(new
            {
                message =
                    "It is not this player's turn."
            });
        }


        // The selected space must be one of the
        // legal destinations calculated by RollDice.
        if (
            !gameState.LegalDestinationIds.Contains(
                request.BoardSpaceId
            )
        )
        {
            return BadRequest(new
            {
                message =
                    "That space is not a legal destination."
            });
        }


        // Find the current player.
        GamePlayerStateDto? currentPlayer =
            gameState.Players.FirstOrDefault(
                player =>
                    player.PlayerNumber ==
                    gameState.CurrentPlayerNumber
            );

        if (currentPlayer is null)
        {
            _logger.LogError(
                "Current player {PlayerNumber} was not found " +
                "in game session {GameSessionId}.",
                gameState.CurrentPlayerNumber,
                gameState.GameSessionId
            );

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "The current player could not be found."
                }
            );
        }


        // Verify that the destination exists on the board.
        BoardSpace destination =
            _boardService.GetSpace(
                request.BoardSpaceId
            );


        // Move the player.
        currentPlayer.BoardSpaceId =
            destination.BoardSpaceId;


        // Movement is now complete.
        gameState.IsWaitingForMove =
            false;

        gameState.DiceRoll =
            null;

        gameState.LegalDestinationIds =
            new List<int>();

        gameState.CanRollDice =
            false;


        // For now, the next gameplay step depends
        // on the type of space the player landed on.
        if (
            destination.SpaceType ==
            BoardSpaceType.RollAgain
        )
        {
            gameState.CanRollDice =
                true;

            gameState.Message =
                $"{currentPlayer.PlayerName} landed on Roll Again.";
        }
        else if (
            destination.SpaceType ==
            BoardSpaceType.Center
        )
        {
            gameState.Message =
                $"{currentPlayer.PlayerName} reached the center.";
        }
        else
        {
            gameState.Message =
                $"{currentPlayer.PlayerName} moved to space " +
                $"{destination.BoardSpaceId} " +
                $"({destination.Category}).";
        }


        // Store the updated state.
        bool updated =
            _gameplaySessionService.UpdateGame(
                gameState
            );

        if (!updated)
        {
            _logger.LogError(
                "Unable to update game session {GameSessionId}.",
                gameState.GameSessionId
            );

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "Unable to update the game session."
                }
            );
        }


        _logger.LogInformation(
            "Player {PlayerNumber} moved to board space {BoardSpaceId} " +
            "in game session {GameSessionId}.",
            currentPlayer.PlayerNumber,
            destination.BoardSpaceId,
            gameState.GameSessionId
        );


        return Ok(gameState);
    }
}