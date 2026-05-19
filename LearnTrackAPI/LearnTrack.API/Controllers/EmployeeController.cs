using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using LearnTrack.Core.DTOs;

namespace LearnTrack.API.Controllers;

[Authorize(Roles = "Admin,Manager")]
[ApiController]
[Route("api/[controller]")]
public class EmployeeController : ControllerBase
{
    private readonly AppDbContext _context;

    public EmployeeController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var query = from user in _context.Users
                    join role in _context.Roles on user.RoleId equals role.Id
                    select new EmployeeListItemDto
                    {
                        Id           = user.Id,
                        EmployeeCode = user.EmployeeCode ?? "N/A",
                        FullName     = $"{user.FirstName} {user.LastName}",
                        Email        = user.Email,
                        Role         = role.Name,
                        IsActive     = user.IsActive
                    };

        var employees = await query.ToListAsync();

        return Ok(new EmployeeResponseDto
        {
            Success = true,
            Data    = employees
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var employee = await (from user in _context.Users
                              join role in _context.Roles on user.RoleId equals role.Id
                              where user.Id == id
                              select new EmployeeListItemDto
                              {
                                  Id           = user.Id,
                                  EmployeeCode = user.EmployeeCode ?? "N/A",
                                  FullName     = $"{user.FirstName} {user.LastName}",
                                  Email        = user.Email,
                                  Role         = role.Name,
                                  IsActive     = user.IsActive
                              }).FirstOrDefaultAsync();

        if (employee == null)
            return NotFound(new { Success = false, Message = "Employee not found" });

        return Ok(new EmployeeDetailResponseDto
        {
            Success = true,
            Data    = employee
        });
    }

    // PATCH: api/employee/{id}
    // Only FirstName, LastName, and Password can be changed
    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] PatchEmployeeDto dto)
    {
        if (dto == null)
            return BadRequest(new { Success = false, Message = "Request body is required" });

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { Success = false, Message = "Employee not found" });

        if (!string.IsNullOrWhiteSpace(dto.FirstName))
            user.FirstName = dto.FirstName;

        if (!string.IsNullOrWhiteSpace(dto.LastName))
            user.LastName = dto.LastName;

        if (!string.IsNullOrWhiteSpace(dto.Password))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Success  = true,
            Message  = "Employee updated successfully",
            Id       = user.Id,
            FullName = $"{user.FirstName} {user.LastName}"
        });
    }
}