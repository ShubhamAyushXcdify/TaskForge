using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using LearnTrack.Core.Entities;
using System.Security.Claims;
using LearnTrack.Core.DTOs;

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
        if (userIdClaim == null) 
            return Unauthorized(new { Success = false, Message = "User not authenticated" });

        var userId = Guid.Parse(userIdClaim);

        var todos = await _context.Todos
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TodoDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                DueDate = t.DueDate,
                IsCompleted = t.IsCompleted,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return Ok(new { Success = true, Data = todos });
    }

    // POST: api/Todo
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTodoDto dto)
    {
        if (dto == null || string.IsNullOrEmpty(dto.Title))
            return BadRequest(new { Success = false, Message = "Title is required" });

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) 
            return Unauthorized(new { Success = false, Message = "User not authenticated" });

        var todo = new Todo
        {
            Id = Guid.NewGuid(),
            UserId = Guid.Parse(userIdClaim),
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Todos.Add(todo);
        await _context.SaveChangesAsync();

        var response = new TodoDto
        {
            Id = todo.Id,
            Title = todo.Title,
            Description = todo.Description,
            DueDate = todo.DueDate,
            IsCompleted = todo.IsCompleted,
            CreatedAt = todo.CreatedAt
        };

        return Ok(new 
        { 
            Success = true, 
            Message = "Todo created successfully", 
            Data = response 
        });
    }

    // PATCH: api/Todo/{id}
    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTodoDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) 
            return Unauthorized(new { Success = false, Message = "User not authenticated" });

        var userId = Guid.Parse(userIdClaim);

        var todo = await _context.Todos
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (todo == null)
            return NotFound(new { Success = false, Message = "Todo not found" });

        if (!string.IsNullOrEmpty(dto.Title))
            todo.Title = dto.Title;

        if (!string.IsNullOrEmpty(dto.Description))
            todo.Description = dto.Description;

        if (dto.DueDate.HasValue)
            todo.DueDate = dto.DueDate;

        if (dto.IsCompleted.HasValue)
        {
            todo.IsCompleted = dto.IsCompleted.Value;
            if (dto.IsCompleted.Value)
                todo.CompletedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        var response = new TodoDto
        {
            Id = todo.Id,
            Title = todo.Title,
            Description = todo.Description,
            DueDate = todo.DueDate,
            IsCompleted = todo.IsCompleted,
            CreatedAt = todo.CreatedAt
        };

        return Ok(new 
        { 
            Success = true, 
            Message = "Todo updated successfully", 
            Data = response 
        });
    }
}