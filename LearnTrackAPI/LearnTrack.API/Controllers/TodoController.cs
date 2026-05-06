using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using LearnTrack.Core.Entities;
using System.Security.Claims;

namespace LearnTrack.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TodoController : ControllerBase
{
    private readonly AppDbContext _context;

    public TodoController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Todo
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();

        var userId = Guid.Parse(userIdClaim);

        var todos = await _context.Todos
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(new { Success = true, Data = todos });
    }

    // POST: api/Todo
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Todo todo)
    {
        if (todo == null || string.IsNullOrEmpty(todo.Title))
            return BadRequest(new { Success = false, Message = "Title is required" });

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();

        todo.Id = Guid.NewGuid();
        todo.UserId = Guid.Parse(userIdClaim);
        todo.CreatedAt = DateTime.UtcNow;
        todo.IsCompleted = false;

        _context.Todos.Add(todo);
        await _context.SaveChangesAsync();

        return Ok(new 
        { 
            Success = true, 
            Message = "Todo created successfully", 
            Data = todo 
        });
    }
}