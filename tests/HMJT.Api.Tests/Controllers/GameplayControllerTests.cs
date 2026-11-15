using HMJT.Controllers;
using HMJT.DTOs.Gameplay;
using HMJT.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;

namespace HMJT.Api.Tests.Controllers;

public class GameplayControllerTests
{
    // =====================================
    // Helper
    // =====================================

    private static GameplayController CreateController(
        GameplaySessionService? sessionService = null)
    {
        sessionService ??=
            new GameplaySessionService();

        var boardService =
            new BoardService();

        return new GameplayController(
            NullLogger<GameplayController>.Instance,
            sessionService,
            boardService
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
    public void Move_IllegalDestination_ReturnsBadRequest()
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
            controller.Move(
                request
            );


        // Assert
        Assert.IsType<BadRequestObjectResult>(
            result.Result
        );

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
public void Move_WrongPlayer_ReturnsBadRequest()
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
        controller.Move(
            request
        );


    // Assert
    Assert.IsType<BadRequestObjectResult>(
        result.Result
    );

    Assert.Equal(
        43,
        gameState.Players[0].BoardSpaceId
    );

    Assert.Equal(
        43,
        gameState.Players[1].BoardSpaceId
    );
}
}