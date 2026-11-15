using HMJT.Models;

namespace HMJT.Services;

// Stores the structure of the Code Pursuit board
// and calculates legal movement destinations.
public class BoardService
{
    // Stores all spaces that exist on the board.
    private readonly List<BoardSpace> _spaces;


    // Creates the complete board when the service is created.
    public BoardService()
    {
        _spaces = CreateBoard();
    }


    // =====================================
    // Get all board spaces
    // =====================================

    public List<BoardSpace> GetAllSpaces()
    {
        return _spaces;
    }


    // =====================================
    // Get one board space
    // =====================================

    public BoardSpace GetSpace(int boardSpaceId)
    {
        BoardSpace? space =
            _spaces.FirstOrDefault(
                space =>
                    space.BoardSpaceId ==
                    boardSpaceId
            );

        if (space is null)
        {
            throw new ArgumentOutOfRangeException(
                nameof(boardSpaceId),
                "The requested board space does not exist."
            );
        }

        return space;
    }


    // =====================================
    // Create complete board
    // =====================================

    private static List<BoardSpace> CreateBoard()
    {
        var spaces = new List<BoardSpace>();


        // =====================================
        // Outer ring - spaces 1 to 24
        // =====================================

        spaces.Add(CreateCategorySpace(1, "C#"));
        spaces.Add(CreateCategorySpace(2, "Game History"));
        spaces.Add(CreateCategorySpace(3, "JavaScript"));
        spaces.Add(CreateRollAgainSpace(4));

        spaces.Add(CreateCategorySpace(5, "Python"));
        spaces.Add(CreateCategorySpace(6, "C#"));
        spaces.Add(CreateCategorySpace(7, "Java"));
        spaces.Add(CreateRollAgainSpace(8));

        spaces.Add(CreateCategorySpace(9, "HTML/CSS"));
        spaces.Add(CreateCategorySpace(10, "Game History"));
        spaces.Add(CreateCategorySpace(11, "Python"));
        spaces.Add(CreateRollAgainSpace(12));

        spaces.Add(CreateCategorySpace(13, "JavaScript"));
        spaces.Add(CreateCategorySpace(14, "Java"));
        spaces.Add(CreateCategorySpace(15, "C#"));
        spaces.Add(CreateRollAgainSpace(16));

        spaces.Add(CreateCategorySpace(17, "HTML/CSS"));
        spaces.Add(CreateCategorySpace(18, "Python"));
        spaces.Add(CreateCategorySpace(19, "Game History"));
        spaces.Add(CreateRollAgainSpace(20));

        spaces.Add(CreateCategorySpace(21, "Java"));
        spaces.Add(CreateCategorySpace(22, "HTML/CSS"));
        spaces.Add(CreateCategorySpace(23, "JavaScript"));
        spaces.Add(CreateRollAgainSpace(24));


        // =====================================
        // Inner paths - spaces 25 to 42
        // =====================================

        // Game History path.
        spaces.Add(CreateCategorySpace(25, "Game History"));
        spaces.Add(CreateCategorySpace(26, "Python"));
        spaces.Add(CreateCategorySpace(27, "Java"));

        // Java path.
        spaces.Add(CreateCategorySpace(28, "Java"));
        spaces.Add(CreateCategorySpace(29, "HTML/CSS"));
        spaces.Add(CreateCategorySpace(30, "C#"));

        // Python path.
        spaces.Add(CreateCategorySpace(31, "Python"));
        spaces.Add(CreateCategorySpace(32, "JavaScript"));
        spaces.Add(CreateCategorySpace(33, "Game History"));

        // C# path.
        spaces.Add(CreateCategorySpace(34, "C#"));
        spaces.Add(CreateCategorySpace(35, "Java"));
        spaces.Add(CreateCategorySpace(36, "HTML/CSS"));

        // HTML/CSS path.
        spaces.Add(CreateCategorySpace(37, "HTML/CSS"));
        spaces.Add(CreateCategorySpace(38, "Python"));
        spaces.Add(CreateCategorySpace(39, "JavaScript"));

        // JavaScript path.
        spaces.Add(CreateCategorySpace(40, "JavaScript"));
        spaces.Add(CreateCategorySpace(41, "C#"));
        spaces.Add(CreateCategorySpace(42, "Java"));


        // =====================================
        // Center - space 43
        // =====================================

        spaces.Add(
            new BoardSpace
            {
                BoardSpaceId = 43,
                SpaceType = BoardSpaceType.Center,
                Category = null
            }
        );


        // =====================================
        // Connect outer ring
        // =====================================

        for (int i = 1; i <= 24; i++)
        {
            BoardSpace currentSpace =
                spaces.First(
                    space =>
                        space.BoardSpaceId == i
                );

            int previousId =
                i == 1
                    ? 24
                    : i - 1;

            int nextId =
                i == 24
                    ? 1
                    : i + 1;

            currentSpace.ConnectedSpaceIds.Add(
                previousId
            );

            currentSpace.ConnectedSpaceIds.Add(
                nextId
            );
        }


        // =====================================
        // Connect inner paths
        // =====================================

        ConnectPath(
            spaces,
            outerSpaceId: 2,
            firstInnerId: 25,
            secondInnerId: 26,
            thirdInnerId: 27
        );

        ConnectPath(
            spaces,
            outerSpaceId: 6,
            firstInnerId: 28,
            secondInnerId: 29,
            thirdInnerId: 30
        );

        ConnectPath(
            spaces,
            outerSpaceId: 10,
            firstInnerId: 31,
            secondInnerId: 32,
            thirdInnerId: 33
        );

        ConnectPath(
            spaces,
            outerSpaceId: 14,
            firstInnerId: 34,
            secondInnerId: 35,
            thirdInnerId: 36
        );

        ConnectPath(
            spaces,
            outerSpaceId: 18,
            firstInnerId: 37,
            secondInnerId: 38,
            thirdInnerId: 39
        );

        ConnectPath(
            spaces,
            outerSpaceId: 22,
            firstInnerId: 40,
            secondInnerId: 41,
            thirdInnerId: 42
        );


        // =====================================
        // Connect center to all six inner paths
        // =====================================

        int[] centerConnections =
        {
            27,
            30,
            33,
            36,
            39,
            42
        };

        BoardSpace center =
            spaces.First(
                space =>
                    space.BoardSpaceId == 43
            );

        foreach (int connectionId
                 in centerConnections)
        {
            center.ConnectedSpaceIds.Add(
                connectionId
            );
        }


        return spaces;
    }


    // =====================================
    // Create category space
    // =====================================

    private static BoardSpace CreateCategorySpace(
        int id,
        string category)
    {
        return new BoardSpace
        {
            BoardSpaceId = id,
            SpaceType = BoardSpaceType.Category,
            Category = category
        };
    }


    // =====================================
    // Create Roll Again space
    // =====================================

    private static BoardSpace CreateRollAgainSpace(
        int id)
    {
        return new BoardSpace
        {
            BoardSpaceId = id,
            SpaceType = BoardSpaceType.RollAgain,
            Category = null
        };
    }


    // =====================================
    // Connect one inner path
    // =====================================

    private static void ConnectPath(
        List<BoardSpace> spaces,
        int outerSpaceId,
        int firstInnerId,
        int secondInnerId,
        int thirdInnerId)
    {
        BoardSpace outer =
            spaces.First(
                space =>
                    space.BoardSpaceId ==
                    outerSpaceId
            );

        BoardSpace first =
            spaces.First(
                space =>
                    space.BoardSpaceId ==
                    firstInnerId
            );

        BoardSpace second =
            spaces.First(
                space =>
                    space.BoardSpaceId ==
                    secondInnerId
            );

        BoardSpace third =
            spaces.First(
                space =>
                    space.BoardSpaceId ==
                    thirdInnerId
            );


        // Outer ring <-> first inner space.
        outer.ConnectedSpaceIds.Add(
            firstInnerId
        );

        first.ConnectedSpaceIds.Add(
            outerSpaceId
        );


        // First inner <-> second inner.
        first.ConnectedSpaceIds.Add(
            secondInnerId
        );

        second.ConnectedSpaceIds.Add(
            firstInnerId
        );


        // Second inner <-> third inner.
        second.ConnectedSpaceIds.Add(
            thirdInnerId
        );

        third.ConnectedSpaceIds.Add(
            secondInnerId
        );


        // Third inner -> center.
        third.ConnectedSpaceIds.Add(43);
    }


    // =====================================
    // Calculate reachable spaces
    // =====================================

    public List<BoardSpace> GetReachableSpaces(
        int startSpaceId,
        int numberOfSteps)
    {
        if (numberOfSteps < 0)
        {
            throw new ArgumentOutOfRangeException(
                nameof(numberOfSteps),
                "The number of steps cannot be negative."
            );
        }


        // Verify that the start space exists.
        GetSpace(startSpaceId);


        if (numberOfSteps == 0)
        {
            return new List<BoardSpace>
            {
                GetSpace(startSpaceId)
            };
        }


        // Stores every possible movement route.
        var paths =
            new List<List<int>>
            {
                new List<int>
                {
                    startSpaceId
                }
            };


        for (
            int step = 0;
            step < numberOfSteps;
            step++
        )
        {
            var nextPaths =
                new List<List<int>>();


            foreach (List<int> path in paths)
            {
                int currentSpaceId =
                    path[^1];

                BoardSpace currentSpace =
                    GetSpace(currentSpaceId);


                foreach (
                    int connectedSpaceId
                    in currentSpace.ConnectedSpaceIds
                )
                {
                    // Do not use the same space twice
                    // during one movement.
                    if (
                        path.Contains(
                            connectedSpaceId
                        )
                    )
                    {
                        continue;
                    }


                    var newPath =
                        new List<int>(path)
                        {
                            connectedSpaceId
                        };

                    nextPaths.Add(
                        newPath
                    );
                }
            }


            paths = nextPaths;
        }


        return paths
            .Select(
                path =>
                    path[^1]
            )
            .Distinct()
            .Select(GetSpace)
            .ToList();
    }


    // =====================================
    // Get legal destinations after dice roll
    // =====================================

    public List<BoardSpace> GetLegalDestinations(
        int startSpaceId,
        int diceRoll)
    {
        // Verify that the start space exists.
        GetSpace(startSpaceId);


        if (
            diceRoll < 1 ||
            diceRoll > 6
        )
        {
            throw new ArgumentOutOfRangeException(
                nameof(diceRoll),
                "The dice roll must be between 1 and 6."
            );
        }


        // Rolling 6 is a wildcard.
        // The player may move to any other board space.
        if (diceRoll == 6)
        {
            return GetAllSpaces()
                .Where(
                    space =>
                        space.BoardSpaceId !=
                        startSpaceId
                )
                .ToList();
        }


        // Rolls from 1 to 5 move the exact
        // number of spaces through the board.
        return GetReachableSpaces(
            startSpaceId,
            diceRoll
        );
    }
}