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
                DueDate = t.DueDate,
                IsCompleted = t.IsCompleted,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return Ok(new { Success = true, Data = todos });
    }

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
}