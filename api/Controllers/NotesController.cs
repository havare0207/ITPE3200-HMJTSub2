
using System.Security.Claims;
using HMJT.DAL;
using HMJT.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HMJT.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotesController : ControllerBase
{
    private readonly INotesRepository _notesRepository;

    public NotesController(INotesRepository notesRepository)
    {
        _notesRepository = notesRepository;
    }

    // GET: api/notes
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Note>>> GetNotes()
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var notes = await _notesRepository.GetAll(userId);

        return Ok(notes);
    }

    // GET: api/notes/1
    [HttpGet("{id}")]
    public async Task<ActionResult<Note>> GetNote(int id)
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var note = await _notesRepository.GetNoteById(
            id,
            userId
        );

        if (note == null)
        {
            return NotFound();
        }

        return Ok(note);
    }

    // POST: api/notes
    [HttpPost]
    public async Task<ActionResult<Note>> CreateNote(Note note)
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        // Set the owner using the authenticated user.
        // Never trust an owner ID sent from the frontend.
        note.OwnerUserId = userId;

        await _notesRepository.Create(note);

        return CreatedAtAction(
            nameof(GetNote),
            new { id = note.NoteId },
            note
        );
   
    }
    // PUT: api/notes/1
[HttpPut("{id}")]
public async Task<IActionResult> UpdateNote(int id, Note note)
{
    var userId = User.FindFirstValue(
        ClaimTypes.NameIdentifier
    );

    if (string.IsNullOrEmpty(userId))
    {
        return Unauthorized();
    }

    note.NoteId = id;

    var updated = await _notesRepository.Update(
        note,
        userId
    );

    if (!updated)
    {
        return NotFound();
    }

    return NoContent();
}

    // DELETE: api/notes/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNote(int id)
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var deleted = await _notesRepository.Delete(
            id,
            userId
        );

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
