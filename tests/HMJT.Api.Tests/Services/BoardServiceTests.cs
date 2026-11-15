using HMJT.Services;

namespace HMJT.Api.Tests.Services;

public class BoardServiceTests
{
    [Fact]
    public void GetSpace_ExistingSpace_ReturnsCorrectSpace()
    {
        // Arrange
        var service = new BoardService();

        // Act
        var space = service.GetSpace(43);

        // Assert
        Assert.Equal(43, space.BoardSpaceId);
    }


    [Fact]
    public void GetLegalDestinations_NormalRoll_ReturnsReachableSpaces()
    {
        // Arrange
        var service = new BoardService();

        // Act
        var destinations =
            service.GetLegalDestinations(
                startSpaceId: 43,
                diceRoll: 1
            );

        // Assert
        Assert.Equal(6, destinations.Count);

        Assert.Contains(
            destinations,
            space => space.BoardSpaceId == 27
        );

        Assert.Contains(
            destinations,
            space => space.BoardSpaceId == 30
        );

        Assert.Contains(
            destinations,
            space => space.BoardSpaceId == 33
        );

        Assert.Contains(
            destinations,
            space => space.BoardSpaceId == 36
        );

        Assert.Contains(
            destinations,
            space => space.BoardSpaceId == 39
        );

        Assert.Contains(
            destinations,
            space => space.BoardSpaceId == 42
        );
    }


    [Fact]
    public void GetLegalDestinations_RollOfSix_ReturnsAllOtherSpaces()
    {
        // Arrange
        var service = new BoardService();

        // Act
        var destinations =
            service.GetLegalDestinations(
                startSpaceId: 43,
                diceRoll: 6
            );

        // Assert
        Assert.Equal(42, destinations.Count);

        Assert.DoesNotContain(
            destinations,
            space => space.BoardSpaceId == 43
        );
    }


    [Fact]
    public void GetLegalDestinations_InvalidDiceRoll_ThrowsException()
    {
        // Arrange
        var service = new BoardService();

        // Act and assert
        Assert.Throws<ArgumentOutOfRangeException>(
            () =>
                service.GetLegalDestinations(
                    startSpaceId: 43,
                    diceRoll: 7
                )
        );
    }
}