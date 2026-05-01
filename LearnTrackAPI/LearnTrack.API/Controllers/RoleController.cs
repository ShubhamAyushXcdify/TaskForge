using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using LearnTrack.API.DTOs;

namespace LearnTrack.API.Controllers;

[Authorize(Roles = "Admin,Manager")]
[ApiController]
[Route("api/[controller]")]
public class RoleController : ControllerBase
{
    private readonly AppDbContext _context;

    public RoleController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var roles = await _context.Roles
            .Select(r => new RoleItemDto
            {
                Id = r.Id,
                Name = r.Name
            })
            .ToListAsync();

        return Ok(new RoleResponseDto
        {
            Success = true,
            Data = roles
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var role = await _context.Roles
            .Where(r => r.Id == id)
            .Select(r => new RoleItemDto
            {
                Id = r.Id,
                Name = r.Name
            })
            .FirstOrDefaultAsync();

        if (role == null)
        {
            return NotFound(new { Success = false, Message = "Role not found" });
        }

        return Ok(new { Success = true, Data = role });
    }
}