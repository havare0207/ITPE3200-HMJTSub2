using System.Collections.Concurrent;
using HMJT.DTOs.Gameplay;

namespace HMJT.Services;

public class GameplaySessionService
{
    // Active local games are stored in memory.
    // ConcurrentDictionary allows safe access if several
    // API requests are handled at the same time.
    private readonly ConcurrentDictionary<Guid, GameStateDto>
        _gameSessions = new();


    // =====================================
    // Store a new game session
    // =====================================

    public bool AddGame(GameStateDto gameState)
    {
        return _gameSessions.TryAdd(
            gameState.GameSessionId,
            gameState
        );
    }


    // =====================================
    // Find an active game session
    // =====================================

    public GameStateDto? GetGame(Guid gameSessionId)
    {
        _gameSessions.TryGetValue(
            gameSessionId,
            out GameStateDto? gameState
        );

        return gameState;
    }


    // =====================================
    // Update an existing game session
    // =====================================

    public bool UpdateGame(GameStateDto gameState)
    {
        if (!_gameSessions.ContainsKey(
                gameState.GameSessionId))
        {
            return false;
        }

        _gameSessions[gameState.GameSessionId] =
            gameState;

        return true;
    }


    // =====================================
    // Remove a game session
    // =====================================

    public bool RemoveGame(Guid gameSessionId)
    {
        return _gameSessions.TryRemove(
            gameSessionId,
            out _
        );
    }
}