using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
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
        GameplaySessionService? sessionService = null,
        Game? customGame = null,
        string? userId = null)
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
            presetQuestionRepository,
            new FakeGameRepository(customGame)
        )
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = userId is null
                        ? new ClaimsPrincipal(new ClaimsIdentity())
                        : new ClaimsPrincipal(new ClaimsIdentity(
                            new[] { new Claim(ClaimTypes.NameIdentifier, userId) },
                            "TestAuthentication"))
                }
            }
        };
    }


    // =====================================
    // Start game - valid request
    // =====================================

    [Fact]
    public async Task StartGame_ValidRequest_ReturnsOk()
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
            await controller.StartGame(request);


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
    public async Task StartGame_DuplicatePlayerNames_ReturnsBadRequest()
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
            await controller.StartGame(request);


        // Assert
        Assert.IsType<BadRequestObjectResult>(
            result.Result
        );
    }


    // =====================================
    // Confirm game
    // =====================================

    [Fact]
    public async Task ConfirmStartGame_ValidRequest_CreatesGameSession()
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
            await controller.ConfirmStartGame(
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
    public async Task StartGame_InvalidDifficulty_ReturnsBadRequest()
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
            await controller.StartGame(request);


        // Assert
        Assert.IsType<BadRequestObjectResult>(
            result.Result
        );
    }


    // =====================================
    // Start game - custom game without ID
    // =====================================

    [Fact]
    public async Task StartGame_CustomGameWithoutId_ReturnsBadRequest()
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
            await controller.StartGame(request);


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
    public void AnswerQuestion_CorrectAnswer_AwardsWedgeAndChangesPlayer()
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

                CurrentGameplayQuestion = new GameplayQuestion
                {
                    QuestionId = 1,
                    Category = "Java",
                    Difficulty = Difficulty.Easy,
                    QuestionText = "Which keyword creates a class?",
                    AnswerA = "class",
                    AnswerB = "define",
                    AnswerC = "struct",
                    AnswerD = "new",
                    CorrectAnswer = AnswerOption.A,
                    IsPresetQuestion = true
                },

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
            controller.AnswerQuestion(
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


    // =====================================
    // Custom game repository and test fixtures
    // =====================================

    private const string OwnerId = "owner-1";
    private const int CustomGameId = 42;
    private static readonly string[] Categories =
    {
        "Java", "JavaScript", "HTML/CSS", "Python", "Game History", "C#"
    };

    private sealed class FakeGameRepository : IGameRepository
    {
        private readonly Game? _game;

        public FakeGameRepository(Game? game) => _game = game;

        public Task<Game?> GetByIdForUser(int id, string userId) =>
            Task.FromResult(_game is not null && _game.GameId == id &&
                _game.OwnerUserId == userId ? _game : null);

        public Task<IEnumerable<Game>> GetAllForUser(string userId) =>
            Task.FromResult<IEnumerable<Game>>(
                _game is not null && _game.OwnerUserId == userId
                    ? new[] { _game } : Array.Empty<Game>());

        // Gameplay must not modify saved games through the repository.
        public Task Create(Game game) => throw new NotSupportedException();
        public Task Update(Game game) => throw new NotSupportedException();
        public Task<bool> Delete(int id, string userId) => throw new NotSupportedException();
        public Task SetPresetQuestion(int gameId, IEnumerable<int> presetQuestionIds) =>
            throw new NotSupportedException();
    }

    // A complete Easy deck combines three custom and three preset questions.
    private static Game CreateCustomGame(bool complete = true)
    {
        var game = new Game
        {
            GameId = CustomGameId,
            Name = "Test game",
            OwnerUserId = OwnerId,
            Questions = new List<Question>(),
            PresetQuestions = new List<PresetQuestion>()
        };

        for (int i = 0; i < 3; i++)
        {
            game.Questions.Add(new Question
            {
                QuestionId = i + 1,
                GameId = CustomGameId,
                Category = Categories[i],
                Difficulty = Difficulty.Easy,
                QuestionText = $"Custom {Categories[i]}",
                AnswerA = "Wrong", AnswerB = "Correct",
                AnswerC = "Wrong", AnswerD = "Wrong",
                CorrectAnswer = AnswerOption.B
            });
        }

        for (int i = 3; i < (complete ? 6 : 5); i++)
        {
            game.PresetQuestions.Add(new PresetQuestion
            {
                PresetQuestionId = i + 1,
                Category = Categories[i],
                Difficulty = Difficulty.Easy,
                QuestionText = $"Preset {Categories[i]}",
                AnswerA = "Correct", AnswerB = "Wrong",
                AnswerC = "Wrong", AnswerD = "Wrong",
                CorrectAnswer = AnswerOption.A
            });
        }

        return game;
    }

    private static StartGameRequestDto CustomStart(string difficulty = "Easy", int id = CustomGameId) =>
        new()
        {
            GameMode = "Custom", Difficulty = difficulty, CustomGameId = id,
            PlayerNames = new List<string> { "Alex", "Emma" }
        };

    private static ConfirmStartGameRequestDto CustomConfirm(string difficulty = "Easy", int id = CustomGameId) =>
        new()
        {
            GameMode = "Custom", Difficulty = difficulty, CustomGameId = id,
            StartingPlayerNumber = 1,
            Players = new List<GamePlayerDto>
            {
                new() { PlayerNumber = 1, PlayerName = "Alex" },
                new() { PlayerNumber = 2, PlayerName = "Emma" }
            }
        };

    private static GameStateDto GetState(ActionResult<GameStateDto> result) =>
        Assert.IsType<GameStateDto>(Assert.IsType<OkObjectResult>(result.Result).Value);

    private static async Task<GameStateDto> StartCustomSession(GameplayController controller) =>
        GetState(await controller.ConfirmStartGame(CustomConfirm()));

    // =====================================
    // Custom game setup and difficulty availability
    // =====================================

    [Fact]
    public async Task StartGame_CompleteCustomDeck_ReturnsOk()
    {
        var controller = CreateController(customGame: CreateCustomGame(), userId: OwnerId);
        Assert.IsType<OkObjectResult>((await controller.StartGame(CustomStart())).Result);
    }

    [Theory]
    [InlineData("Medium")]
    [InlineData("Hard")]
    public async Task StartGame_UnavailableDifficulty_ReturnsBadRequest(string difficulty)
    {
        var controller = CreateController(customGame: CreateCustomGame(), userId: OwnerId);
        Assert.IsType<BadRequestObjectResult>((await controller.StartGame(CustomStart(difficulty))).Result);
    }

    [Fact]
    public async Task StartGame_SixQuestionsButMissingCategory_ReturnsBadRequest()
    {
        var game = CreateCustomGame(false);
        game.Questions.Add(new Question
        {
            QuestionId = 99, GameId = CustomGameId, Category = "Java",
            Difficulty = Difficulty.Easy, QuestionText = "Extra Java question",
            AnswerA = "A", AnswerB = "B", AnswerC = "C", AnswerD = "D",
            CorrectAnswer = AnswerOption.A
        });
        var controller = CreateController(customGame: game, userId: OwnerId);
        Assert.IsType<BadRequestObjectResult>((await controller.StartGame(CustomStart())).Result);
    }

    [Fact]
    public async Task ConfirmStartGame_CompleteCustomDeck_StoresBothQuestionSources()
    {
        var sessions = new GameplaySessionService();
        var controller = CreateController(sessions, CreateCustomGame(), OwnerId);
        var state = await StartCustomSession(controller);
        Assert.Equal(OwnerId, state.OwnerUserId);
        Assert.Equal(CustomGameId, state.CustomGameId);
        Assert.Equal(6, state.CustomQuestions.Count);
        Assert.Equal(3, state.CustomQuestions.Count(q => q.IsPresetQuestion));
        Assert.All(state.CustomQuestions, q => Assert.Equal(Difficulty.Easy, q.Difficulty));
        Assert.Same(state, sessions.GetGame(state.GameSessionId));
    }

    [Fact]
    public async Task ConfirmStartGame_MissingCategory_ReturnsBadRequest()
    {
        var controller = CreateController(customGame: CreateCustomGame(false), userId: OwnerId);
        Assert.IsType<BadRequestObjectResult>((await controller.ConfirmStartGame(CustomConfirm())).Result);
    }

    [Fact]
    public async Task GetCustomGameDifficulties_ReturnsCategoryCoverage()
    {
        var controller = CreateController(customGame: CreateCustomGame(), userId: OwnerId);
        var result = Assert.IsType<OkObjectResult>(await controller.GetCustomGameDifficulties(CustomGameId));
        using var json = JsonDocument.Parse(JsonSerializer.Serialize(result.Value));
        var items = json.RootElement.EnumerateArray().ToArray();
        Assert.Equal(3, items.Length);
        var easy = Assert.Single(items,x => x.GetProperty("difficulty").GetString() == "Easy");
        Assert.True(easy.GetProperty("isAvailable").GetBoolean());
        Assert.Equal(6, easy.GetProperty("availableCategoryCount").GetInt32());
        Assert.Equal(0, easy.GetProperty("missingCategories").GetArrayLength());
        foreach (var item in items.Where(x => x.GetProperty("difficulty").GetString() != "Easy"))
        {
            Assert.False(item.GetProperty("isAvailable").GetBoolean());
            Assert.Equal(0, item.GetProperty("availableCategoryCount").GetInt32());
            Assert.Equal(6, item.GetProperty("missingCategories").GetArrayLength());
        }
    }

    [Fact]
    public async Task GetCustomGameDifficulties_IncompleteDeck_ReportsMissingCategory()
    {
        var controller = CreateController(customGame: CreateCustomGame(false), userId: OwnerId);
        var result = Assert.IsType<OkObjectResult>(await controller.GetCustomGameDifficulties(CustomGameId));
        using var json = JsonDocument.Parse(JsonSerializer.Serialize(result.Value));
        var easy = Assert.Single(json.RootElement.EnumerateArray(),x => x.GetProperty("difficulty").GetString() == "Easy");
        Assert.False(easy.GetProperty("isAvailable").GetBoolean());
        Assert.Equal(5, easy.GetProperty("availableCategoryCount").GetInt32());
        Assert.Equal("C#", Assert.Single(easy.GetProperty("missingCategories").EnumerateArray()).GetString());
    }

    // =====================================
    // Custom gameplay and question isolation
    // =====================================

    [Theory]
    [InlineData("Java", "Custom Java", "B", true)]
    [InlineData("Python", "Preset Python", "A", true)]
    [InlineData("Java", "Custom Java", "A", false)]
    public async Task CustomGame_CenterQuestion_UsesSelectedDeckAndCorrectAnswer(
        string category, string text, string answer, bool correct)
    {
        var controller = CreateController(customGame: CreateCustomGame(), userId: OwnerId);
        var state = await StartCustomSession(controller);
        state.NeedsCenterCategory = true;
        state.CanRollDice = false;
        var selected = GetState(await controller.SelectCenterCategory(new SelectCenterCategoryRequestDto
        {
            GameSessionId = state.GameSessionId, CurrentPlayerNumber = 1, Category = category
        }));
        Assert.NotNull(selected.ActiveQuestion);
        Assert.Equal(text, selected.ActiveQuestion.QuestionText);
        var answered = GetState(controller.AnswerQuestion(new AnswerQuestionRequestDto
        {
            GameSessionId = state.GameSessionId, CurrentPlayerNumber = 1,
            QuestionId = selected.ActiveQuestion.QuestionId, SelectedAnswer = answer
        }));
        Assert.Equal(correct, answered.Players[0].Wedges.Contains(category));
        Assert.Equal(2, answered.CurrentPlayerNumber);
        Assert.Null(answered.ActiveQuestion);
        Assert.Null(answered.CurrentGameplayQuestion);
    }

    [Theory]
    [InlineData("B", true)]
    [InlineData("A", false)]
    public async Task CustomGame_FinalAnswer_WinsOrRequiresRetry(string answer, bool wins)
    {
        var controller = CreateController(customGame: CreateCustomGame(), userId: OwnerId);
        var state = await StartCustomSession(controller);
        foreach (string category in Categories)
            state.Players[0].Wedges.Add(category);
        state.NeedsFinalCategory = true;
        state.CanRollDice = false;
        var selected = GetState(await controller.SelectFinalCategory(new SelectCenterCategoryRequestDto
        {
            GameSessionId = state.GameSessionId, CurrentPlayerNumber = 1, Category = "Java"
        }));
        Assert.True(selected.IsFinalQuestion);
        Assert.NotNull(selected.ActiveQuestion);
        var answered = GetState(controller.AnswerQuestion(new AnswerQuestionRequestDto
        {
            GameSessionId = state.GameSessionId, CurrentPlayerNumber = 1,
            QuestionId = selected.ActiveQuestion.QuestionId, SelectedAnswer = answer
        }));
        Assert.Equal(wins, answered.IsGameOver);
        Assert.Equal(wins ? "Alex" : null, answered.WinnerName);
        Assert.Equal(!wins, answered.Players[0].MustLeaveCenterBeforeFinalRetry);
        Assert.Equal(!wins, answered.CanRollDice);
        Assert.Null(answered.CurrentGameplayQuestion);
    }

    [Fact]
    public async Task CustomGame_SerializedState_DoesNotExposeCorrectAnswersOrOwner()
    {
        var controller = CreateController(customGame: CreateCustomGame(), userId: OwnerId);
        var state = await StartCustomSession(controller);
        state.NeedsCenterCategory = true;
        state.CanRollDice = false;
        GetState(await controller.SelectCenterCategory(new SelectCenterCategoryRequestDto
        {
            GameSessionId = state.GameSessionId, CurrentPlayerNumber = 1, Category = "Java"
        }));
        var json = JsonSerializer.Serialize(state, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;
        Assert.False(root.TryGetProperty("ownerUserId", out _));
        Assert.False(root.TryGetProperty("customQuestions", out _));
        Assert.False(root.TryGetProperty("currentGameplayQuestion", out _));
        Assert.False(root.GetProperty("activeQuestion").TryGetProperty("correctAnswer", out _));
    }

    // =====================================
    // Authorization of saved games and active sessions
    // =====================================

    [Theory]
    [InlineData(null, 401)]
    [InlineData("other-user", 404)]
    public async Task CustomGame_SetupEndpoints_RejectUnauthorizedAccess(string? userId, int status)
    {
        var controller = CreateController(customGame: CreateCustomGame(), userId: userId);
        Assert.Equal(status, Assert.IsAssignableFrom<ObjectResult>((await controller.StartGame(CustomStart())).Result).StatusCode);
        Assert.Equal(status, Assert.IsAssignableFrom<ObjectResult>((await controller.ConfirmStartGame(CustomConfirm())).Result).StatusCode);
        Assert.Equal(status, Assert.IsAssignableFrom<ObjectResult>(await controller.GetCustomGameDifficulties(CustomGameId)).StatusCode);
    }

    [Fact]
    public async Task CustomGame_UnknownId_ReturnsNotFound()
    {
        var controller = CreateController(customGame: CreateCustomGame(), userId: OwnerId);
        Assert.IsType<NotFoundObjectResult>((await controller.StartGame(CustomStart(id: 999))).Result);
        Assert.IsType<NotFoundObjectResult>((await controller.ConfirmStartGame(CustomConfirm(id: 999))).Result);
        Assert.IsType<NotFoundObjectResult>(await controller.GetCustomGameDifficulties(999));
    }

    [Theory]
    [InlineData("roll", null, 401)]
    [InlineData("move", null, 401)]
    [InlineData("answer", null, 401)]
    [InlineData("center", null, 401)]
    [InlineData("final", null, 401)]
    [InlineData("reset", null, 401)]
    [InlineData("roll", "other-user", 403)]
    [InlineData("move", "other-user", 403)]
    [InlineData("answer", "other-user", 403)]
    [InlineData("center", "other-user", 403)]
    [InlineData("final", "other-user", 403)]
    [InlineData("reset", "other-user", 403)]
    public async Task CustomSession_NonOwnerOrAnonymous_CannotModifySession(
        string action, string? userId, int status)
    {
        var sessions = new GameplaySessionService();
        var owner = CreateController(sessions, CreateCustomGame(), OwnerId);
        var state = await StartCustomSession(owner);
        var controller = CreateController(sessions, userId: userId);
        var id = state.GameSessionId;
        var before = JsonSerializer.Serialize(state);
        ActionResult? result = action switch
        {
            "roll" => controller.RollDice(new RollDiceRequestDto { GameSessionId = id, CurrentPlayerNumber = 1 }).Result,
            "move" => (await controller.Move(new MoveRequestDto { GameSessionId = id, CurrentPlayerNumber = 1, BoardSpaceId = 27 })).Result,
            "answer" => controller.AnswerQuestion(new AnswerQuestionRequestDto { GameSessionId = id, CurrentPlayerNumber = 1, QuestionId = 1, SelectedAnswer = "B" }).Result,
            "center" => (await controller.SelectCenterCategory(new SelectCenterCategoryRequestDto { GameSessionId = id, CurrentPlayerNumber = 1, Category = "Java" })).Result,
            "final" => (await controller.SelectFinalCategory(new SelectCenterCategoryRequestDto { GameSessionId = id, CurrentPlayerNumber = 1, Category = "Java" })).Result,
            "reset" => controller.ResetGame(id),
            _ => throw new ArgumentOutOfRangeException(nameof(action))
        };
        Assert.Equal(status, Assert.IsAssignableFrom<ObjectResult>(result).StatusCode);
        Assert.Same(state, sessions.GetGame(id));
        Assert.Equal(before, JsonSerializer.Serialize(state));
    }

    [Fact]
    public async Task CustomSession_Owner_CanRollMoveAndReset()
    {
        var sessions = new GameplaySessionService();
        var controller = CreateController(sessions, CreateCustomGame(), OwnerId);
        var state = await StartCustomSession(controller);
        var rolled = GetState(controller.RollDice(new RollDiceRequestDto
        {
            GameSessionId = state.GameSessionId, CurrentPlayerNumber = 1
        }));
        Assert.InRange(rolled.DiceRoll.GetValueOrDefault(), 1, 6);
        Assert.NotEmpty(rolled.LegalDestinationIds);
        var destination = rolled.LegalDestinationIds[0];
        var moved = GetState(await controller.Move(new MoveRequestDto
        {
            GameSessionId = state.GameSessionId, CurrentPlayerNumber = 1, BoardSpaceId = destination
        }));
        Assert.Equal(destination, moved.Players[0].BoardSpaceId);
        Assert.IsType<NoContentResult>(controller.ResetGame(state.GameSessionId));
        Assert.Null(sessions.GetGame(state.GameSessionId));
    }

    [Fact]
    public async Task StandardSession_Anonymous_CanRollAndReset()
    {
        var sessions = new GameplaySessionService();
        var controller = CreateController(sessions);
        var request = CustomConfirm();
        request.GameMode = "Standard";
        request.CustomGameId = null;
        var state = GetState(await controller.ConfirmStartGame(request));
        GetState(controller.RollDice(new RollDiceRequestDto
        {
            GameSessionId = state.GameSessionId, CurrentPlayerNumber = 1
        }));
        Assert.IsType<NoContentResult>(controller.ResetGame(state.GameSessionId));
        Assert.Null(sessions.GetGame(state.GameSessionId));
    }
}
