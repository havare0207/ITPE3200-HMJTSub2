using HMJT.Models;

namespace HMJT.DAL;

public interface INotesRepository
{
    Task<IEnumerable<Note>> GetAll(string ownerUserId);

    Task<Note?> GetNoteById(int id, string ownerUserId);

    Task Create(Note note);

    Task Update(Note note);

    Task<bool> Delete(int id);
}
