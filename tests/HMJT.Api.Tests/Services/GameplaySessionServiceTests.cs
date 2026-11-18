using HMJT.DTOs.Gameplay;
using HMJT.Services;

namespace HMJT.Api.Tests.Services;

public class GameplaySessionServiceTests
{
    [Fact]
    public void AddGame_ValidGame_CanBeRetrieved()
    {
        // Arrange
        var service =
            new GameplaySessionService();

        var gameState =
            new GameStateDto
            {
                GameSessionId =
                    Guid.NewGuid(),

                CurrentPlayerNumber =
                    1
            };


        // Act
        bool added =
            service.AddGame(gameState);

        GameStateDto? storedGame =
            service.GetGame(
                gameState.GameSessionId
            );


        // Assert
        Assert.True(added);
        Assert.NotNull(storedGame);

        Assert.Equal(
            gameState.GameSessionId,
            storedGame.GameSessionId
        );
    }


    [Fact]
    public void UpdateGame_ExistingGame_UpdatesState()
    {
        // Arrange
        var service =
            new GameplaySessionService();

        var gameState =
            new GameStateDto
            {
                GameSessionId =
                    Guid.NewGuid(),

                CurrentPlayerNumber =
                    1,

                CanRollDice =
                    true
            };

        service.AddGame(gameState);


        // Act
        gameState.CanRollDice =
            false;

        gameState.DiceRoll =
            4;

        bool updated =
            service.UpdateGame(gameState);

        GameStateDto? storedGame =
            service.GetGame(
                gameState.GameSessionId
            );


        // Assert
        Assert.True(updated);
        Assert.NotNull(storedGame);

        Assert.False(
            storedGame.CanRollDice
        );

        Assert.Equal(
            4,
            storedGame.DiceRoll
        );
    }


    [Fact]
    public void RemoveGame_ExistingGame_RemovesGame()
    {
        // Arrange
        var service =
            new GameplaySessionService();

        var gameState =
            new GameStateDto
            {
                GameSessionId =
                    Guid.NewGuid()
            };

        service.AddGame(gameState);


        // Act
        bool removed =
            service.RemoveGame(
                gameState.GameSessionId
            );

        GameStateDto? storedGame =
            service.GetGame(
                gameState.GameSessionId
            );


        // Assert
        Assert.True(removed);
        Assert.Null(storedGame);
    }
}