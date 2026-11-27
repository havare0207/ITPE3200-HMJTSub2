using HMJT.DTOs.Gameplay;
using HMJT.Models;
using HMJT.Services;
using HMJT.DAL;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HMJT.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameplayController : ControllerBase
{
    private readonly ILogger<GameplayController> _logger;
    private readonly GameplaySessionService _gameplaySessionService;
    private readonly BoardService _boardService;
    private readonly IPresetQuestionRepository _presetQuestionRepository;
    private readonly IGameRepository _gameRepository;

    public GameplayController(
        ILogger<GameplayController> logger,
        GameplaySessionService gameplaySessionService,
        BoardService boardService,
        IPresetQuestionRepository presetQuestionRepository,
        IGameRepository gameRepository)
    {
        _logger = logger;

        _gameplaySessionService =
            gameplaySessionService;

        _boardService =
            boardService;

        _presetQuestionRepository =
            presetQuestionRepository;

        _gameRepository =
            gameRepository;
    }

    // =====================================
    // Get available custom game difficulties
    // =====================================

    [HttpGet("custom/{customGameId:int}/difficulties")]
    public async Task<ActionResult> GetCustomGameDifficulties(
        int customGameId)
    {
        // Custom games require authentication.
        string? userId =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (User.Identity?.IsAuthenticated != true ||
            string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new
            {
                message =
                    "You must log in to access custom games."
            });
        }

        // Only retrieve games owned by the current user.
        Game? customGame =
            await _gameRepository.GetByIdForUser(
                customGameId,
                userId
            );

        if (customGame is null)
        {
            return NotFound(new
            {
                message =
                    "The custom game could not be found."
            });
        }

        // All six categories must be available.
        string[] requiredCategories =
        {
            "Java",
            "JavaScript",
            "HTML/CSS",
            "Python",
            "Game History",
            "C#"
        };

        // Combine custom and selected preset questions.
        var questions = customGame.Questions
            .Select(question => new
            {
                question.Category,
                question.Difficulty
            })
            .Concat(
                customGame.PresetQuestions.Select(question => new
                {
                    question.Category,
                    question.Difficulty
                })
            )
            .ToList();

        // Check category coverage for every difficulty.
        var difficulties = Enum.GetValues<Difficulty>()
            .Select(difficulty =>
            {
                var missingCategories = requiredCategories
                    .Where(category =>
                        !questions.Any(question =>
                            question.Difficulty == difficulty &&
                            question.Category.Equals(
                                category,
                                StringComparison.OrdinalIgnoreCase
                            )
                        )
                    )
                    .ToList();

                return new
                {
                    difficulty = difficulty.ToString(),

                    isAvailable =
                        missingCategories.Count == 0,

                    availableCategoryCount =
                        requiredCategories.Length -
                        missingCategories.Count,

                    missingCategories
                };
            })
            .ToList();

        return Ok(difficulties);
    }


    // =====================================
    // Start a new Code Pursuit game
    // =====================================

    [HttpPost("start")]
    public async Task<ActionResult<StartGameResponseDto>> StartGame(
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

        // Validate custom game availability before
        // selecting the starting player.
        if (request.GameMode.Equals(
                "Custom",
                StringComparison.OrdinalIgnoreCase))
        {
            string? userId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (User.Identity?.IsAuthenticated != true ||
                string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized(new
                {
                    message =
                        "You must log in to play a custom game."
                });
            }

            Game? customGame =
                await _gameRepository.GetByIdForUser(
                    request.CustomGameId!.Value,
                    userId
                );

            if (customGame is null)
            {
                return NotFound(new
                {
                    message =
                        "The custom game could not be found."
                });
            }

            Difficulty selectedDifficulty =
                Enum.Parse<Difficulty>(
                    request.Difficulty,
                    true
                );

            string[] requiredCategories =
            {
                "Java",
                "JavaScript",
                "HTML/CSS",
                "Python",
                "Game History",
                "C#"
            };

            List<string> missingCategories =
                requiredCategories
                    .Where(category =>
                        !customGame.Questions.Any(question =>
                            question.Difficulty == selectedDifficulty &&
                            question.Category.Equals(
                                category,
                                StringComparison.OrdinalIgnoreCase
                            )
                        ) &&
                        !customGame.PresetQuestions.Any(question =>
                            question.Difficulty == selectedDifficulty &&
                            question.Category.Equals(
                                category,
                                StringComparison.OrdinalIgnoreCase
                            )
                        )
                    )
                    .ToList();

            if (missingCategories.Count > 0)
            {
                return BadRequest(new
                {
                    message =
                        $"The selected custom game is missing " +
                        $"{request.Difficulty} questions in the following " +
                        $"categories: {string.Join(", ", missingCategories)}."
                });
            }
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
    public async Task<ActionResult<GameStateDto>> ConfirmStartGame(
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

        // Validate custom game ownership before
        // creating the gameplay session.
        string? ownerUserId = null;

        List<GameplayQuestion> customQuestions = new();

        if (request.GameMode.Equals(
                "Custom",
                StringComparison.OrdinalIgnoreCase))
        {
            ownerUserId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (User.Identity?.IsAuthenticated != true ||
                string.IsNullOrWhiteSpace(ownerUserId))
            {
                return Unauthorized(new
                {
                    message =
                        "You must log in to play a custom game."
                });
            }

            if (request.CustomGameId is null)
            {
                return BadRequest(new
                {
                    message =
                        "A custom game must be selected."
                });
            }

            Game? customGame =
                await _gameRepository.GetByIdForUser(
                    request.CustomGameId.Value,
                    ownerUserId
                );

            if (customGame is null)
            {
                return NotFound(new
                {
                    message =
                        "The custom game could not be found."
                });
            }

            // Convert user-created questions into gameplay questions.
            customQuestions.AddRange(
                customGame.Questions.Select(
                    question => new GameplayQuestion
                    {
                        QuestionId = question.QuestionId,
                        Category = question.Category,
                        QuestionText = question.QuestionText,
                        Difficulty = question.Difficulty,
                        AnswerA = question.AnswerA,
                        AnswerB = question.AnswerB,
                        AnswerC = question.AnswerC,
                        AnswerD = question.AnswerD,
                        CorrectAnswer = question.CorrectAnswer,
                        IsPresetQuestion = false
                    }
                )
            );

            // Convert selected preset questions into gameplay questions.
            customQuestions.AddRange(
                customGame.PresetQuestions.Select(
                    question => new GameplayQuestion
                    {
                        QuestionId = question.PresetQuestionId,
                        Category = question.Category,
                        QuestionText = question.QuestionText,
                        Difficulty = question.Difficulty,
                        AnswerA = question.AnswerA,
                        AnswerB = question.AnswerB,
                        AnswerC = question.AnswerC,
                        AnswerD = question.AnswerD,
                        CorrectAnswer = question.CorrectAnswer,
                        IsPresetQuestion = true
                    }
                )
            );

            // Only use questions matching the selected difficulty.
            Difficulty selectedDifficulty =
                Enum.Parse<Difficulty>(
                    request.Difficulty,
                    true
                );

            customQuestions = customQuestions
                .Where(question =>
                    question.Difficulty == selectedDifficulty)
                .ToList();

            // All six categories must be available
            // so that every player can complete the game.
            string[] requiredCategories =
            {
                "Java",
                "JavaScript",
                "HTML/CSS",
                "Python",
                "Game History",
                "C#"
            };

            List<string> missingCategories =
                requiredCategories
                    .Where(category =>
                        !customQuestions.Any(question =>
                            question.Category.Equals(
                                category,
                                StringComparison.OrdinalIgnoreCase
                            )
                        )
                    )
                    .ToList();

            if (missingCategories.Count > 0)
            {
                return BadRequest(new
                {
                    message =
                        $"The selected custom game is missing " +
                        $"{request.Difficulty} questions in the following " +
                        $"categories: {string.Join(", ", missingCategories)}."
                });
            }

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

                CustomGameId =
                    request.GameMode.Equals(
                        "Custom",
                        StringComparison.OrdinalIgnoreCase)
                            ? request.CustomGameId
                            : null,

                OwnerUserId =
                    ownerUserId,

                CustomQuestions =
                    customQuestions,

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
                
                ActiveQuestion =
                    null,

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

        // Validate access before modifying the game session.
        ActionResult? accessError =
            ValidateSessionAccess(gameState);

        if (accessError is not null)
        {
            return accessError;
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

        // Rolling a 6 allows the player to select
        // the center again while already standing there.
        // This also allows an immediate final question retry.
        if (
            currentPlayer.BoardSpaceId == 43 &&
            diceRoll == 6
        )
        {
            BoardSpace centerSpace =
                _boardService.GetSpace(43);

            if (
                !legalDestinations.Any(
                    space =>
                        space.BoardSpaceId == 43
                )
            )
            {
                legalDestinations.Add(
                    centerSpace
                );
            }
        }


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
    public async Task<ActionResult<GameStateDto>> Move(
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

        // Validate access before modifying the game session.
        ActionResult? accessError =
            ValidateSessionAccess(gameState);

        if (accessError is not null)
        {
            return accessError;
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

        // Retrieve the question before changing the game state.
        GameplayQuestion? destinationQuestion = null;

        if (
            destination.SpaceType == BoardSpaceType.Category &&
            destination.Category != null
        )
        {
            destinationQuestion =
                await GetRandomGameplayQuestion(
                    gameState,
                    destination.Category
                );

            if (destinationQuestion is null)
            {
                return BadRequest(new
                {
                    message =
                        $"No {gameState.Difficulty} question " +
                        $"was found for {destination.Category}."
                });
            }
        }

        // =====================================
        // Final retry movement
        // =====================================

        // If the player previously failed the final
        // question and now leaves the center,
        // another final attempt becomes available.
        if (
            currentPlayer.MustLeaveCenterBeforeFinalRetry &&
            destination.BoardSpaceId != 43
        )
        {
            currentPlayer.MustLeaveCenterBeforeFinalRetry =
                false;
        }


        // Special exception from Subapp 1:
        // rolling a 6 while still in the center allows
        // the player to choose the center again directly.
        if (
            currentPlayer.MustLeaveCenterBeforeFinalRetry &&
            destination.BoardSpaceId == 43 &&
            gameState.DiceRoll == 6
        )
        {
            currentPlayer.MustLeaveCenterBeforeFinalRetry =
                false;
        }


        // Move the player.
        currentPlayer.BoardSpaceId =
            destination.BoardSpaceId;

        // Clear any active question from the previous turn.
        gameState.ActiveQuestion = null;

        gameState.CurrentGameplayQuestion = null;

        // Clear any previous center or final state.
        gameState.NeedsCenterCategory =
            false;

        gameState.NeedsFinalCategory =
            false;

        gameState.IsFinalQuestion =
            false;

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
            // Center has no fixed category.
            // The next step depends on whether
            // the player already owns all six wedges.

            bool hasAllWedges =
                currentPlayer.Wedges.Count >= 6;

            gameState.ActiveQuestion =
                null;

            gameState.CanRollDice =
                false;


            // A player with all six wedges is
            // attempting the final question.
            if (hasAllWedges)
            {
                gameState.NeedsCenterCategory =
                    false;

                gameState.NeedsFinalCategory =
                    !currentPlayer
                        .MustLeaveCenterBeforeFinalRetry;

                gameState.IsFinalQuestion =
                    false;


                if (
                    currentPlayer
                        .MustLeaveCenterBeforeFinalRetry
                )
                {
                    gameState.Message =
                        $"{currentPlayer.PlayerName} reached the center, " +
                        "but must leave the center before trying " +
                        "the final question again.";
                }
                else
                {
                    gameState.Message =
                        $"{currentPlayer.PlayerName} reached the center. " +
                        "The other players must choose the final category.";
                }
            }
            else
            {
                // During a normal round, a player who
                // reaches the center chooses the category
                // for their own question.
                gameState.NeedsCenterCategory =
                    true;

                gameState.NeedsFinalCategory =
                    false;

                gameState.IsFinalQuestion =
                    false;

                gameState.Message =
                    $"{currentPlayer.PlayerName} reached the center " +
                    "and may choose a category.";
            }
        }
        else if (
            destination.SpaceType == BoardSpaceType.Category &&
            destinationQuestion != null
        )
        {
            SetActiveQuestion(
                gameState,
                destinationQuestion
            );

            gameState.Message =
                $"{currentPlayer.PlayerName} landed on " +
                $"{destination.Category}. Answer the question.";
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

    // =====================================
    // Select category after reaching center
    // =====================================

    [HttpPost("select-center-category")]
    public async Task<ActionResult<GameStateDto>> SelectCenterCategory(
        [FromBody] SelectCenterCategoryRequestDto request)
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

        // Validate access before modifying the game session.
        ActionResult? accessError =
            ValidateSessionAccess(gameState);

        if (accessError is not null)
        {
            return accessError;
        }

        // The game cannot continue after
        // a winner has been declared.
        if (gameState.IsGameOver)
        {
            return BadRequest(new
            {
                message =
                    "The game has already ended."
            });
        }


        // Only the current player may make
        // the center category selection.
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


        // This endpoint is only valid after
        // reaching center without all six wedges.
        if (!gameState.NeedsCenterCategory)
        {
            return BadRequest(new
            {
                message =
                    "The game is not waiting for a center category."
            });
        }


        GamePlayerStateDto? currentPlayer =
            gameState.Players.FirstOrDefault(
                player =>
                    player.PlayerNumber ==
                    gameState.CurrentPlayerNumber
            );

        if (currentPlayer is null)
        {
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "The current player could not be found."
                }
            );
        }


        // A center category may only be selected
        // while the player is physically in center.
        if (currentPlayer.BoardSpaceId != 43)
        {
            return BadRequest(new
            {
                message =
                    "The current player is not in the center."
            });
        }


        // A player with all six wedges must use
        // the final-question category flow instead.
        if (currentPlayer.Wedges.Count >= 6)
        {
            return BadRequest(new
            {
                message =
                    "A player with all six wedges must use " +
                    "the final category selection."
            });
        }


        string[] validCategories =
        {
            "Java",
            "JavaScript",
            "HTML/CSS",
            "Python",
            "Game History",
            "C#"
        };


        string? category =
            validCategories.FirstOrDefault(
                validCategory =>
                    validCategory.Equals(
                        request.Category,
                        StringComparison.OrdinalIgnoreCase
                    )
            );

        if (category is null)
        {
            return BadRequest(new
            {
                message =
                    "The selected category is invalid."
            });
        }

        // Retrieve a question from the appropriate question pool.
        GameplayQuestion? question =
            await GetRandomGameplayQuestion(
                gameState,
                category
            );

        if (question is null)
        {
            return BadRequest(new
            {
                message =
                    $"No {gameState.Difficulty} question " +
                    $"was found for {category}."
            });
        }

        // Set the active center question.
        SetActiveQuestion(
            gameState,
            question
        );


        // The center category selection
        // has now been completed.
        gameState.NeedsCenterCategory =
            false;

        gameState.NeedsFinalCategory =
            false;

        gameState.IsFinalQuestion =
            false;

        gameState.CanRollDice =
            false;

        gameState.Message =
            $"{currentPlayer.PlayerName} chose {category} " +
            "in the center. Answer the question.";


        bool updated =
            _gameplaySessionService.UpdateGame(
                gameState
            );

        if (!updated)
        {
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
            "Player {PlayerNumber} selected {Category} " +
            "in the center in game session {GameSessionId}.",
            currentPlayer.PlayerNumber,
            category,
            gameState.GameSessionId
        );


        return Ok(gameState);
    }

    // =====================================
    // Select final category
    // =====================================

    [HttpPost("select-final-category")]
    public async Task<ActionResult<GameStateDto>> SelectFinalCategory(
        [FromBody] SelectCenterCategoryRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }


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

        // Validate access before modifying the game session.
        ActionResult? accessError =
            ValidateSessionAccess(gameState);

        if (accessError is not null)
        {
            return accessError;
        }

        if (gameState.IsGameOver)
        {
            return BadRequest(new
            {
                message =
                    "The game has already ended."
            });
        }


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


        // This endpoint is only valid while
        // waiting for a final category.
        if (!gameState.NeedsFinalCategory)
        {
            return BadRequest(new
            {
                message =
                    "The game is not waiting for a final category."
            });
        }


        GamePlayerStateDto? currentPlayer =
            gameState.Players.FirstOrDefault(
                player =>
                    player.PlayerNumber ==
                    gameState.CurrentPlayerNumber
            );

        if (currentPlayer is null)
        {
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "The current player could not be found."
                }
            );
        }


        // The final question can only be started
        // while the player is in the center.
        if (currentPlayer.BoardSpaceId != 43)
        {
            return BadRequest(new
            {
                message =
                    "The current player is not in the center."
            });
        }


        // The player must have collected
        // all six category wedges.
        if (currentPlayer.Wedges.Count < 6)
        {
            return BadRequest(new
            {
                message =
                    "The player has not collected all six wedges."
            });
        }


        // After failing a final question,
        // the player cannot immediately retry.
        if (currentPlayer.MustLeaveCenterBeforeFinalRetry)
        {
            return BadRequest(new
            {
                message =
                    "The player must leave the center before " +
                    "trying the final question again."
            });
        }


        string[] validCategories =
        {
            "Java",
            "JavaScript",
            "HTML/CSS",
            "Python",
            "Game History",
            "C#"
        };


        string? category =
            validCategories.FirstOrDefault(
                validCategory =>
                    validCategory.Equals(
                        request.Category,
                        StringComparison.OrdinalIgnoreCase
                    )
            );

        if (category is null)
        {
            return BadRequest(new
            {
                message =
                    "The selected category is invalid."
            });
        }

        // Retrieve the final question from the appropriate question pool.
        GameplayQuestion? question =
            await GetRandomGameplayQuestion(
                gameState,
                category
            );

        if (question is null)
        {
            return BadRequest(new
            {
                message =
                    $"No {gameState.Difficulty} question " +
                    $"was found for {category}."
            });
        }

        // Set the active final question.
        SetActiveQuestion(
            gameState,
            question
        );

        // Final category selection is complete.
        gameState.NeedsCenterCategory =
            false;

        gameState.NeedsFinalCategory =
            false;

        gameState.IsFinalQuestion =
            true;

        gameState.CanRollDice =
            false;

        gameState.Message =
            $"Final question for {currentPlayer.PlayerName}: " +
            $"{category}.";


        bool updated =
            _gameplaySessionService.UpdateGame(
                gameState
            );

        if (!updated)
        {
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
            "Player {PlayerNumber} started final question " +
            "in category {Category} in game session {GameSessionId}.",
            currentPlayer.PlayerNumber,
            category,
            gameState.GameSessionId
        );


        return Ok(gameState);
    }

    // =====================================
    // Reset game
    // =====================================

    [HttpDelete("reset/{gameSessionId:guid}")]
    public ActionResult ResetGame(
        Guid gameSessionId)
    {
        GameStateDto? gameState =
            _gameplaySessionService.GetGame(
                gameSessionId
            );

        if (gameState is null)
        {
            return NotFound(new
            {
                message =
                    "The game session could not be found."
            });
        }

        // Validate access before modifying the game session.
        ActionResult? accessError =
            ValidateSessionAccess(gameState);

        if (accessError is not null)
        {
            return accessError;
        }    

        bool removed =
            _gameplaySessionService.RemoveGame(
                gameSessionId
            );

        if (!removed)
        {
            _logger.LogError(
                "Unable to reset game session {GameSessionId}.",
                gameSessionId
            );

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "Unable to reset the game session."
                }
            );
        }


        _logger.LogInformation(
            "Game session {GameSessionId} was reset.",
            gameSessionId
        );


        return NoContent();
    }


    // =====================================
    // Answer the active question
    // =====================================

    [HttpPost("answer")]
    public ActionResult<GameStateDto> AnswerQuestion(
        [FromBody] AnswerQuestionRequestDto request)
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

        // Validate access before modifying the game session.
        ActionResult? accessError =
            ValidateSessionAccess(gameState);

        if (accessError is not null)
        {
            return accessError;
        }

        // The game cannot continue after
        // a winner has been declared.
        if (gameState.IsGameOver)
        {
            return BadRequest(new
            {
                message =
                    "The game has already ended."
            });
        }


        // Only the current player may answer
        // the active gameplay question.
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


        // A question must currently be active.
        if (gameState.ActiveQuestion is null)
        {
            return BadRequest(new
            {
                message =
                    "There is no active question to answer."
            });
        }


        // Prevent a request from answering
        // a different question than the one
        // currently shown to the player.
        if (
            request.QuestionId !=
            gameState.ActiveQuestion.QuestionId
        )
        {
            return BadRequest(new
            {
                message =
                    "The submitted question does not match " +
                    "the active question."
            });
        }

        // Retrieve the full active question stored on the server.
        GameplayQuestion? question =
            gameState.CurrentGameplayQuestion;

        if (
            question is null ||
            question.QuestionId != request.QuestionId
        )
        {
            return NotFound(new
            {
                message =
                    "The active question could not be found."
            });
        }

        // Convert A, B, C or D from the request
        // into the AnswerOption enum used by
        // the question model.
        if (!Enum.TryParse<AnswerOption>(
                request.SelectedAnswer,
                true,
                out AnswerOption selectedAnswer))
        {
            return BadRequest(new
            {
                message =
                    "Selected answer must be A, B, C or D."
            });
        }


        bool isCorrect =
            selectedAnswer ==
            question.CorrectAnswer;


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


        string category =
            gameState.ActiveQuestion.Category;

        // =====================================
        // Final question
        // =====================================

        if (gameState.IsFinalQuestion)
        {
            // The final question is now complete.

            gameState.ActiveQuestion =
                null;

            gameState.CurrentGameplayQuestion = 
                null;

            gameState.IsFinalQuestion =
                false;

            gameState.NeedsCenterCategory =
                false;

            gameState.NeedsFinalCategory =
                false;

            gameState.DiceRoll =
                null;

            gameState.IsWaitingForMove =
                false;

            gameState.LegalDestinationIds =
                new List<int>();


            // A correct final answer wins the game.
            if (isCorrect)
            {
                gameState.IsGameOver =
                    true;

                gameState.WinnerName =
                    currentPlayer.PlayerName;

                gameState.CanRollDice =
                    false;

                gameState.Message =
                    $"{currentPlayer.PlayerName} answered the final " +
                    "question correctly and won the game!";
            }
            else
            {
                // The player must leave the center
                // before another normal final attempt.
                currentPlayer.MustLeaveCenterBeforeFinalRetry =
                    true;


                // The failed final attempt ends this player's turn.
                int currentPlayerIndex =
                    gameState.Players.FindIndex(
                        player =>
                            player.PlayerNumber ==
                            gameState.CurrentPlayerNumber
                    );

                int nextPlayerIndex =
                    (currentPlayerIndex + 1) %
                    gameState.Players.Count;

                GamePlayerStateDto nextPlayer =
                    gameState.Players[nextPlayerIndex];

                gameState.CurrentPlayerNumber =
                    nextPlayer.PlayerNumber;

                gameState.CanRollDice =
                    true;

                gameState.Message =
                    $"{currentPlayer.PlayerName} answered the final " +
                    "question incorrectly and must leave the center " +
                    "before trying again. " +
                    $"{nextPlayer.PlayerName}'s turn.";
            }
        }


        // =====================================
        // Normal question
        // =====================================

        else
        {
            bool awardedWedge =
                false;


            // A correct normal answer awards the
            // category wedge if it is not already owned.
            if (isCorrect)
            {
                bool alreadyHasWedge =
                    currentPlayer.Wedges.Any(
                        wedge =>
                            wedge.Equals(
                                category,
                                StringComparison.OrdinalIgnoreCase
                            )
                    );

                if (!alreadyHasWedge)
                {
                    currentPlayer.Wedges.Add(
                        category
                    );

                    awardedWedge =
                        true;
                }
            }


            // The normal question is complete.
            gameState.ActiveQuestion =
                null;
            
            gameState.CurrentGameplayQuestion = 
                null;

            gameState.IsFinalQuestion =
                false;

            gameState.NeedsCenterCategory =
                false;

            gameState.NeedsFinalCategory =
                false;


            // Move to the next player.
            int currentPlayerIndex =
                gameState.Players.FindIndex(
                    player =>
                        player.PlayerNumber ==
                        gameState.CurrentPlayerNumber
                );

            int nextPlayerIndex =
                (currentPlayerIndex + 1) %
                gameState.Players.Count;

            GamePlayerStateDto nextPlayer =
                gameState.Players[nextPlayerIndex];

            gameState.CurrentPlayerNumber =
                nextPlayer.PlayerNumber;


            // The next player may begin their turn.
            gameState.CanRollDice =
                true;

            gameState.DiceRoll =
                null;

            gameState.IsWaitingForMove =
                false;

            gameState.LegalDestinationIds =
                new List<int>();


            if (isCorrect && awardedWedge)
            {
                gameState.Message =
                    $"{currentPlayer.PlayerName} answered correctly " +
                    $"and earned the {category} wedge. " +
                    $"{nextPlayer.PlayerName}'s turn.";
            }
            else if (isCorrect)
            {
                gameState.Message =
                    $"{currentPlayer.PlayerName} answered correctly. " +
                    $"The {category} wedge was already collected. " +
                    $"{nextPlayer.PlayerName}'s turn.";
            }
            else
            {
                gameState.Message =
                    $"{currentPlayer.PlayerName} answered incorrectly. " +
                    $"{nextPlayer.PlayerName}'s turn.";
            }
        }



        //HER
        // Store the updated game state.
        bool updated =
            _gameplaySessionService.UpdateGame(
                gameState
            );

        if (!updated)
        {
            _logger.LogError(
                "Unable to update game session {GameSessionId} " +
                "after answering a question.",
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
            "Player {PlayerNumber} answered question {QuestionId} " +
            "in game session {GameSessionId}. Correct: {IsCorrect}.",
            currentPlayer.PlayerNumber,
            question.QuestionId,
            gameState.GameSessionId,
            isCorrect
        );


        return Ok(gameState);
    }

    // =====================================
    // Select a random gameplay question
    // =====================================

    private async Task<GameplayQuestion?> GetRandomGameplayQuestion(
        GameStateDto gameState,
        string category)
    {
        if (!Enum.TryParse<Difficulty>(
                gameState.Difficulty,
                true,
                out Difficulty difficulty))
        {
            return null;
        }

        // Standard games use the preset question repository.
        if (gameState.GameMode.Equals(
                "Standard",
                StringComparison.OrdinalIgnoreCase))
        {
            PresetQuestion? question =
                await _presetQuestionRepository
                    .GetRandomQuestionAsync(
                        category,
                        difficulty
                    );

            if (question is null)
            {
                return null;
            }

            return new GameplayQuestion
            {
                QuestionId = question.PresetQuestionId,
                Category = question.Category,
                QuestionText = question.QuestionText,
                Difficulty = question.Difficulty,
                AnswerA = question.AnswerA,
                AnswerB = question.AnswerB,
                AnswerC = question.AnswerC,
                AnswerD = question.AnswerD,
                CorrectAnswer = question.CorrectAnswer,
                IsPresetQuestion = true
            };
        }

        // Custom games use the questions stored
        // in the active gameplay session.
        List<GameplayQuestion> matchingQuestions =
            gameState.CustomQuestions
                .Where(question =>
                    question.Category.Equals(
                        category,
                        StringComparison.OrdinalIgnoreCase
                    ) &&
                    question.Difficulty == difficulty
                )
                .ToList();

        if (matchingQuestions.Count == 0)
        {
            return null;
        }

        int randomIndex =
            Random.Shared.Next(matchingQuestions.Count);

        return matchingQuestions[randomIndex];
    }

    // =====================================
    // Set the active gameplay question
    // =====================================

    private static void SetActiveQuestion(
        GameStateDto gameState,
        GameplayQuestion question)
    {
        // Keep the correct answer on the server.
        gameState.CurrentGameplayQuestion = question;

        // Only expose question text and answer options
        // to the frontend.
        gameState.ActiveQuestion =
            new ActiveQuestionDto
            {
                QuestionId = question.QuestionId,
                Category = question.Category,
                QuestionText = question.QuestionText,
                AnswerA = question.AnswerA,
                AnswerB = question.AnswerB,
                AnswerC = question.AnswerC,
                AnswerD = question.AnswerD
            };
    }

    // =====================================
    // Authorize access to a gameplay session
    // =====================================

    private ActionResult? ValidateSessionAccess(
        GameStateDto gameState)
    {
        // Standard games do not require authentication.
        if (gameState.GameMode.Equals(
                "Standard",
                StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        // Custom games require an authenticated user.
        string? userId =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (User.Identity?.IsAuthenticated != true ||
            string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new
            {
                message =
                    "You must log in to access this custom game."
            });
        }

        // Only the owner may access the custom game session.
        if (gameState.OwnerUserId != userId)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message =
                        "You do not have access to this game session."
                }
            );
        }

        return null;
    }

}