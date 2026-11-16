using HMJT.Controllers;
using HMJT.DTOs.Gameplay;
using HMJT.Services;
using HMJT.DAL;
using HMJT.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;

namespace HMJT.Api.Tests.Controllers;

public class GameplayControllerTests
{
    // =====================================
    // Fake preset question repository
    // =====================================

    // Provides predictable preset-question data
    // without requiring a real database in these tests.
    private class FakePresetQuestionRepository
        : IPresetQuestionRepository
    {
        public Task<IEnumerable<PresetQuestion>> GetAll()
        {
            return Task.FromResult<IEnumerable<PresetQuestion>>(
                new List<PresetQuestion>()
            );
        }

        public Task<PresetQuestion?> GetPresetQuestionById(int id)
        {
            return Task.FromResult<PresetQuestion?>(
                new PresetQuestion
                {
                    PresetQuestionId = id,

                    Category =
                        "Java",

                    Difficulty =
                        Difficulty.Easy,

                    QuestionText =
                        "Which keyword creates a class?",

                    AnswerA =
                        "class",

                    AnswerB =
                        "define",

                    AnswerC =
                        "struct",

                    AnswerD =
                        "new",

                    CorrectAnswer =
                        AnswerOption.A
                }
            );
        }

        public Task<IEnumerable<PresetQuestion>> GetByIds(
            IEnumerable<int> ids)
        {
            return Task.FromResult<IEnumerable<PresetQuestion>>(
                new List<PresetQuestion>()
            );
        }

        public Task<IEnumerable<PresetQuestion>> Search(
            string? category,
            Difficulty? difficulty)
        {
            return Task.FromResult<IEnumerable<PresetQuestion>>(
                new List<PresetQuestion>()
            );
        }

        // Returns a predictable question for gameplay tests.
        // The requested category and difficulty are copied
        // into the returned question.
        public Task<PresetQuestion?> GetRandomQuestionAsync(
            string category,
            Difficulty difficulty)
        {
            return Task.FromResult<PresetQuestion?>(
                new PresetQuestion
                {
                    PresetQuestionId = 1,

                    Category =
                        category,

                    Difficulty =
                        difficulty,

                    QuestionText =
                        "Which keyword creates a class?",

                    AnswerA =
                        "class",

                    AnswerB =
                        "define",

                    AnswerC =
                        "struct",

                    AnswerD =
                        "new",

                    CorrectAnswer =
                        AnswerOption.A
                }
            );
        }
    }


    // =====================================
    // Helper
    // =====================================

    // Creates a GameplayController with the
    // services required by the gameplay API.
    //
    // A fake preset-question repository is used
    // so controller tests do not depend on the
    // real application database.
    private static GameplayController CreateController(
        GameplaySessionService? sessionService = null)
    {
        sessionService ??=
            new GameplaySessionService();

        var boardService =
            new BoardService();

        var presetQuestionRepository =
            new FakePresetQuestionRepository();

        return new GameplayController(
            NullLogger<GameplayController>.Instance,
            sessionService,
            boardService,
            presetQuestionRepository
        );
    }


    // =====================================
    // Start game - valid request
    // =====================================

    [Fact]
    public void StartGame_ValidRequest_ReturnsOk()
    {
        // Arrange
        GameplayController controller =
            CreateController();

        var request =
            new StartGameRequestDto
            {
                GameMode = "Standard",
                Difficulty = "Easy",

                PlayerNames =
                    new List<string>
                    {
                        "Alex",
                        "Emma"
                    },

                CustomGameId = null
            };


        // Act
        ActionResult<StartGameResponseDto> result =
            controller.StartGame(request);


        // Assert
        OkObjectResult okResult =
            Assert.IsType<OkObjectResult>(
                result.Result
            );

        StartGameResponseDto response =
            Assert.IsType<StartGameResponseDto>(
                okResult.Value
            );

        Assert.Equal(
            2,
            response.Players.Count
        );

        Assert.Contains(
            response.StartingPlayerNumber,
            new[] { 1, 2 }
        );
    }


    // =====================================
    // Start game - duplicate names
    // =====================================

    [Fact]
    public void StartGame_DuplicatePlayerNames_ReturnsBadRequest()
    {
        // Arrange
        GameplayController controller =
            CreateController();

        var request =
            new StartGameRequestDto
            {
                GameMode = "Standard",
                Difficulty = "Easy",

                PlayerNames =
                    new List<string>
                    {
                        "Alex",
                        "alex"
                    },

                CustomGameId = null
            };


        // Act
        ActionResult<StartGameResponseDto> result =
            controller.StartGame(request);


        // Assert
        Assert.IsType<BadRequestObjectResult>(
            result.Result
        );
    }


    // =====================================
    // Confirm game
    // =====================================

    [Fact]
    public void ConfirmStartGame_ValidRequest_CreatesGameSession()
    {
        // Arrange
        var sessionService =
            new GameplaySessionService();

        GameplayController controller =
            CreateController(
                sessionService
            );

        var request =
            new ConfirmStartGameRequestDto
            {
                GameMode = "Standard",
                Difficulty = "Medium",

                StartingPlayerNumber = 1,

                Players =
                    new List<GamePlayerDto>
                    {
                        new GamePlayerDto
                        {
                            PlayerNumber = 1,
                            PlayerName = "Alex"
                        },

                        new GamePlayerDto
                        {
                            PlayerNumber = 2,
                            PlayerName = "Emma"
                        }
                    }
            };


        // Act
        ActionResult<GameStateDto> result =
            controller.ConfirmStartGame(
                request
            );


        // Assert
        OkObjectResult okResult =
            Assert.IsType<OkObjectResult>(
                result.Result
            );

        GameStateDto gameState =
            Assert.IsType<GameStateDto>(
                okResult.Value
            );


        Assert.Equal(
            1,
            gameState.CurrentPlayerNumber
        );

        Assert.True(
            gameState.CanRollDice
        );

        Assert.False(
            gameState.IsWaitingForMove
        );

        Assert.Equal(
            43,
            gameState.Players[0].BoardSpaceId
        );

        // No question should be active
        // when the game is first created.
        Assert.Null(
            gameState.ActiveQuestion
        );


        GameStateDto? storedGame =
            sessionService.GetGame(
                gameState.GameSessionId
            );

        Assert.NotNull(
            storedGame
        );
    }


    // =====================================
    // Move - illegal destination
    // =====================================

    [Fact]
    public async Task Move_IllegalDestination_ReturnsBadRequest()
    {
        // Arrange
        var sessionService =
            new GameplaySessionService();

        GameplayController controller =
            CreateController(
                sessionService
            );

        Guid gameSessionId =
            Guid.NewGuid();

        var gameState =
            new GameStateDto
            {
                GameSessionId =
                    gameSessionId,

                GameMode =
                    "Standard",

                Difficulty =
                    "Easy",

                CurrentPlayerNumber =
                    1,

                CanRollDice =
                    false,

                DiceRoll =
                    2,

                IsWaitingForMove =
                    true,

                LegalDestinationIds =
                    new List<int>
                    {
                        27,
                        30
                    },

                Players =
                    new List<GamePlayerStateDto>
                    {
                        new GamePlayerStateDto
                        {
                            PlayerNumber = 1,
                            PlayerName = "Alex",
                            BoardSpaceId = 43
                        },

                        new GamePlayerStateDto
                        {
                            PlayerNumber = 2,
                            PlayerName = "Emma",
                            BoardSpaceId = 43
                        }
                    }
            };

        sessionService.AddGame(
            gameState
        );


        var request =
            new MoveRequestDto
            {
                GameSessionId =
                    gameSessionId,

                CurrentPlayerNumber =
                    1,

                // Space 5 is not in LegalDestinationIds.
                BoardSpaceId =
                    5
            };


        // Act
        ActionResult<GameStateDto> result =
            await controller.Move(
                request
            );


        // Assert
        Assert.IsType<BadRequestObjectResult>(
            result.Result
        );

        // The player should remain in the center
        // when an illegal destination is rejected.
        Assert.Equal(
            43,
            gameState.Players[0].BoardSpaceId
        );
    }


    // =====================================
    // Start game - invalid difficulty
    // =====================================

    [Fact]
    public void StartGame_InvalidDifficulty_ReturnsBadRequest()
    {
        // Arrange
        GameplayController controller =
            CreateController();

        var request =
            new StartGameRequestDto
            {
                GameMode = "Standard",
                Difficulty = "Impossible",

                PlayerNames =
                    new List<string>
                    {
                        "Alex",
                        "Emma"
                    },

                CustomGameId = null
            };


        // Act
        ActionResult<StartGameResponseDto> result =
            controller.StartGame(request);


        // Assert
        Assert.IsType<BadRequestObjectResult>(
            result.Result
        );
    }


    // =====================================
    // Start game - custom game without ID
    // =====================================

    [Fact]
    public void StartGame_CustomGameWithoutId_ReturnsBadRequest()
    {
        // Arrange
        GameplayController controller =
            CreateController();

        var request =
            new StartGameRequestDto
            {
                GameMode = "Custom",
                Difficulty = "Easy",

                PlayerNames =
                    new List<string>
                    {
                        "Alex",
                        "Emma"
                    },

                CustomGameId = null
            };


        // Act
        ActionResult<StartGameResponseDto> result =
            controller.StartGame(request);


        // Assert
        Assert.IsType<BadRequestObjectResult>(
            result.Result
        );
    }


    // =====================================
    // Move - wrong player
    // =====================================

    [Fact]
    public async Task Move_WrongPlayer_ReturnsBadRequest()
    {
        // Arrange
        var sessionService =
            new GameplaySessionService();

        GameplayController controller =
            CreateController(
                sessionService
            );

        Guid gameSessionId =
            Guid.NewGuid();

        var gameState =
            new GameStateDto
            {
                GameSessionId =
                    gameSessionId,

                GameMode =
                    "Standard",

                Difficulty =
                    "Easy",

                CurrentPlayerNumber =
                    1,

                CanRollDice =
                    false,

                DiceRoll =
                    1,

                IsWaitingForMove =
                    true,

                LegalDestinationIds =
                    new List<int>
                    {
                        27
                    },

                Players =
                    new List<GamePlayerStateDto>
                    {
                        new GamePlayerStateDto
                        {
                            PlayerNumber = 1,
                            PlayerName = "Alex",
                            BoardSpaceId = 43
                        },

                        new GamePlayerStateDto
                        {
                            PlayerNumber = 2,
                            PlayerName = "Emma",
                            BoardSpaceId = 43
                        }
                    }
            };

        sessionService.AddGame(
            gameState
        );


        var request =
            new MoveRequestDto
            {
                GameSessionId =
                    gameSessionId,

                // Player 2 tries to move
                // during Player 1's turn.
                CurrentPlayerNumber =
                    2,

                BoardSpaceId =
                    27
            };


        // Act
        ActionResult<GameStateDto> result =
            await controller.Move(
                request
            );


        // Assert
        Assert.IsType<BadRequestObjectResult>(
            result.Result
        );

        // Neither player should have moved
        // after the invalid request.
        Assert.Equal(
            43,
            gameState.Players[0].BoardSpaceId
        );

        Assert.Equal(
            43,
            gameState.Players[1].BoardSpaceId
        );
    }

    // =====================================
    // Move - category space creates question
    // =====================================

    [Fact]
    public async Task Move_CategorySpace_CreatesActiveQuestion()
    {
        // Arrange
        var sessionService =
            new GameplaySessionService();

        GameplayController controller =
            CreateController(
                sessionService
            );

        Guid gameSessionId =
            Guid.NewGuid();

        var gameState =
            new GameStateDto
            {
                GameSessionId =
                    gameSessionId,

                GameMode =
                    "Standard",

                Difficulty =
                    "Easy",

                CurrentPlayerNumber =
                    1,

                CanRollDice =
                    false,

                DiceRoll =
                    1,

                IsWaitingForMove =
                    true,

                // Space 27 is a Java category space
                // reachable from the center with a roll of 1.
                LegalDestinationIds =
                    new List<int>
                    {
                        27
                    },

                Players =
                    new List<GamePlayerStateDto>
                    {
                        new GamePlayerStateDto
                        {
                            PlayerNumber = 1,
                            PlayerName = "Alex",
                            BoardSpaceId = 43
                        },

                        new GamePlayerStateDto
                        {
                            PlayerNumber = 2,
                            PlayerName = "Emma",
                            BoardSpaceId = 43
                        }
                    }
            };

        sessionService.AddGame(
            gameState
        );


        var request =
            new MoveRequestDto
            {
                GameSessionId =
                    gameSessionId,

                CurrentPlayerNumber =
                    1,

                BoardSpaceId =
                    27
            };


        // Act
        ActionResult<GameStateDto> result =
            await controller.Move(
                request
            );


        // Assert
        OkObjectResult okResult =
            Assert.IsType<OkObjectResult>(
                result.Result
            );

        GameStateDto returnedState =
            Assert.IsType<GameStateDto>(
                okResult.Value
            );


        // The player should have moved
        // from the center to space 27.
        Assert.Equal(
            27,
            returnedState.Players[0].BoardSpaceId
        );


        // Landing on a category space in
        // Standard Game should create a question.
        Assert.NotNull(
            returnedState.ActiveQuestion
        );


        // Space 27 is a Java category space.
        Assert.Equal(
            "Java",
            returnedState.ActiveQuestion.Category
        );


        // The fake repository returns Easy
        // because that is the selected game difficulty.
        Assert.Equal(
            "Which keyword creates a class?",
            returnedState.ActiveQuestion.QuestionText
        );


        // The movement phase should now be complete.
        Assert.False(
            returnedState.IsWaitingForMove
        );

        Assert.Empty(
            returnedState.LegalDestinationIds
        );

        Assert.Null(
            returnedState.DiceRoll
        );


        // The player must answer the question
        // before another dice roll is allowed.
        Assert.False(
            returnedState.CanRollDice
        );
    }

    // =====================================
    // Answer question - correct answer
    // =====================================

    [Fact]
    public async Task AnswerQuestion_CorrectAnswer_AwardsWedgeAndChangesPlayer()
    {
        // Arrange
        var sessionService =
            new GameplaySessionService();

        GameplayController controller =
            CreateController(
                sessionService
            );

        Guid gameSessionId =
            Guid.NewGuid();

        var gameState =
            new GameStateDto
            {
                GameSessionId =
                    gameSessionId,

                GameMode =
                    "Standard",

                Difficulty =
                    "Easy",

                CurrentPlayerNumber =
                    1,

                CanRollDice =
                    false,

                DiceRoll =
                    null,

                IsWaitingForMove =
                    false,

                LegalDestinationIds =
                    new List<int>(),

                ActiveQuestion =
                    new ActiveQuestionDto
                    {
                        QuestionId = 1,

                        Category =
                            "Java",

                        QuestionText =
                            "Which keyword creates a class?",

                        AnswerA =
                            "class",

                        AnswerB =
                            "define",

                        AnswerC =
                            "struct",

                        AnswerD =
                            "new"
                    },

                Players =
                    new List<GamePlayerStateDto>
                    {
                        new GamePlayerStateDto
                        {
                            PlayerNumber = 1,
                            PlayerName = "Alex",
                            BoardSpaceId = 27,
                            Wedges = new List<string>()
                        },

                        new GamePlayerStateDto
                        {
                            PlayerNumber = 2,
                            PlayerName = "Emma",
                            BoardSpaceId = 43,
                            Wedges = new List<string>()
                        }
                    }
            };

        sessionService.AddGame(
            gameState
        );


        var request =
            new AnswerQuestionRequestDto
            {
                GameSessionId =
                    gameSessionId,

                CurrentPlayerNumber =
                    1,

                QuestionId =
                    1,

                // A is the correct answer in
                // FakePresetQuestionRepository.
                SelectedAnswer =
                    "A"
            };


        // Act
        ActionResult<GameStateDto> result =
            await controller.AnswerQuestion(
                request
            );


        // Assert
        OkObjectResult okResult =
            Assert.IsType<OkObjectResult>(
                result.Result
            );

        GameStateDto returnedState =
            Assert.IsType<GameStateDto>(
                okResult.Value
            );


        // The correct Java answer should
        // award the Java wedge.
        Assert.Contains(
            "Java",
            returnedState.Players[0].Wedges
        );


        // The completed question should no
        // longer be active.
        Assert.Null(
            returnedState.ActiveQuestion
        );


        // The turn should move from
        // Player 1 to Player 2.
        Assert.Equal(
            2,
            returnedState.CurrentPlayerNumber
        );


        // Player 2 should now be allowed
        // to begin the next turn.
        Assert.True(
            returnedState.CanRollDice
        );


        Assert.False(
            returnedState.IsWaitingForMove
        );


        Assert.Empty(
            returnedState.LegalDestinationIds
        );
    }

}