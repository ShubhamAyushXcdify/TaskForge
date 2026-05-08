using LearnTrack.Core.Entities;
using LearnTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearnTrack.Core.DTOs;
using System.Security.Claims;

namespace LearnTrack.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .Include(u => u.Role)
            .Select(user => new UserResponseDto
            {
                UserId = user.Id,
                Email = user.Email,
                Role = user.Role != null ? user.Role.Name : "N/A",
                FirstName = user.FirstName ?? "",
                LastName = user.LastName ?? "",
                EmployeeCode = user.EmployeeCode ?? "",
                IsActive = user.IsActive,
                IsEmailVerified = user.IsEmailVerified
            }).ToListAsync();

        return Ok(new { Success = true, Message = "Users retrieved successfully", Data = users });
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        if (dto == null || string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.PasswordHash))
            return BadRequest(new { Success = false, Message = "Email and Password are required" });

        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
            return BadRequest(new { Success = false, Message = "Email already exists" });

        var role = await _context.Roles.FindAsync(dto.RoleId);
        if (role == null)
            return BadRequest(new { Success = false, Message = "Invalid RoleId" });

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.PasswordHash),
            FirstName = dto.FirstName ?? "",
            LastName = dto.LastName ?? "",
            EmployeeCode = dto.EmployeeCode ?? "",
            RoleId = dto.RoleId,
            IsActive = true,
            IsEmailVerified = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var responseDto = new UserResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            Role = role.Name,
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            EmployeeCode = user.EmployeeCode ?? "",
            IsActive = user.IsActive,
            IsEmailVerified = user.IsEmailVerified
        };

        return Ok(new { Success = true, Message = "User created successfully", Data = responseDto });
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
            return NotFound(new { Success = false, Message = "User not found" });

        if (!string.IsNullOrEmpty(dto.Email)) user.Email = dto.Email;
        if (!string.IsNullOrEmpty(dto.FirstName)) user.FirstName = dto.FirstName;
        if (!string.IsNullOrEmpty(dto.LastName)) user.LastName = dto.LastName;
        if (!string.IsNullOrEmpty(dto.EmployeeCode)) user.EmployeeCode = dto.EmployeeCode;
        if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;
        if (dto.RoleId.HasValue) user.RoleId = dto.RoleId.Value;

        if (!string.IsNullOrEmpty(dto.PasswordHash))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.PasswordHash);

        await _context.SaveChangesAsync();

        var response = new UserResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role?.Name ?? "N/A",
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            EmployeeCode = user.EmployeeCode ?? "",
            IsActive = user.IsActive,
            IsEmailVerified = user.IsEmailVerified
        };

        return Ok(new { Success = true, Message = "User updated successfully", Data = response });
    }
}