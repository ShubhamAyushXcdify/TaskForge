using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using LearnTrack.API.DTOs;

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
        // Joining Users with Roles to get the formatted Employee List
        var query = from user in _context.Users
                    join role in _context.Roles on user.RoleId equals role.Id
                    select new EmployeeListItemDto
                    {
                        Id = user.Id,
                        EmployeeCode = user.EmployeeCode ?? "N/A",
                        FullName = $"{user.FirstName} {user.LastName}",
                        Email = user.Email,
                        Role = role.Name,
                        IsActive = user.IsActive
                    };

        var employees = await query.ToListAsync();

        return Ok(new EmployeeResponseDto
        {
            Success = true,
            Data = employees
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        // Manual join to fetch a specific employee's details with their Role name
        var employee = await (from user in _context.Users
                              join role in _context.Roles on user.RoleId equals role.Id
                              where user.Id == id
                              select new EmployeeListItemDto
                              {
                                  Id = user.Id,
                                  EmployeeCode = user.EmployeeCode ?? "N/A",
                                  FullName = $"{user.FirstName} {user.LastName}",
                                  Email = user.Email,
                                  Role = role.Name,
                                  IsActive = user.IsActive
                              }).FirstOrDefaultAsync();

        if (employee == null)
        {
            return NotFound(new { Success = false, Message = "Employee not found" });
        }

        return Ok(new EmployeeDetailResponseDto 
        { 
            Success = true, 
            Data = employee 
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEmployeeDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        
        if (user == null)
        {
            return NotFound(new { Success = false, Message = "Employee not found" });
        }

        // Apply updates from the DTO to the User entity
        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Email = dto.Email;
        user.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return Ok(new { Success = true, Message = "Employee updated successfully" });
    }
}