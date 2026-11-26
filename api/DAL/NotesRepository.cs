using HMJT.Models;
using Microsoft.EntityFrameworkCore;

namespace HMJT.DAL;

public class NotesRepository : INotesRepository
{
    private readonly GameDbContext _db;

    public NotesRepository(GameDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<Note>> GetAll(string ownerUserId)
    {
        return await _db.Set<Note>()
            .Where(note => note.OwnerUserId == ownerUserId)
            .ToListAsync();
    }

    public async Task<Note?> GetNoteById(int id, string ownerUserId)
    {
        return await _db.Set<Note>()
            .FirstOrDefaultAsync(note =>
                note.NoteId == id &&
                note.OwnerUserId == ownerUserId
            );
    }

    public async Task Create(Note note)
    {
        _db.Set<Note>().Add(note);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> Update(Note note, string ownerUserId)
    {
        var existingNote = await GetNoteById(note.NoteId, ownerUserId);

        if (existingNote == null)
        {
            return false;
        }

        existingNote.Title = note.Title;
        existingNote.Content = note.Content;

        await _db.SaveChangesAsync();

        return true;
    }
    public async Task<bool> Delete(int id, string ownerUserId)
    {
        var note = await GetNoteById(id, ownerUserId);

        if (note == null)
        {
            return false;
        }

        _db.Set<Note>().Remove(note);
        await _db.SaveChangesAsync();

        return true;
    }
}
