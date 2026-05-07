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

    // GET ALL USERS (Admin only)
    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users.ToListAsync();

        var response = users.Select(user => new UserResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role?.Name ?? "N/A",
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            EmployeeCode = user.EmployeeCode ?? "",
            IsActive = user.IsActive,
            IsEmailVerified = user.IsEmailVerified
        }).ToList();

        return Ok(new { Success = true, Message = "Users retrieved successfully", Data = response });
    }

    // GET USER BY ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound(new { Success = false, Message = "User not found" });

        var response = new UserResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            Role = "User",
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            EmployeeCode = user.EmployeeCode ?? "",
            IsActive = user.IsActive,
            IsEmailVerified = user.IsEmailVerified
        };

        return Ok(new { Success = true, Message = "User retrieved successfully", Data = response });
    }

    // POST: Create User - Auto ID (No need to send Id from frontend)
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        if (dto == null || string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.PasswordHash))
            return BadRequest(new { Success = false, Message = "Email and Password are required" });

        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { Success = false, Message = "Email already exists" });

        var user = new User
        {
            Id = Guid.NewGuid(),           // Auto Generate ID
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.PasswordHash),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            EmployeeCode = dto.EmployeeCode,
            RoleId = dto.RoleId,
            IsActive = true,
            IsEmailVerified = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var response = new UserResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            Role = "User",
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            EmployeeCode = user.EmployeeCode ?? "",
            IsActive = user.IsActive,
            IsEmailVerified = user.IsEmailVerified
        };

        return Ok(new { Success = true, Message = "User created successfully", Data = response });
    }

    // PATCH: Update User Details
    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { Success = false, Message = "User not found" });

        if (!string.IsNullOrEmpty(dto.Email))
            user.Email = dto.Email;

        if (!string.IsNullOrEmpty(dto.FirstName))
            user.FirstName = dto.FirstName;

        if (!string.IsNullOrEmpty(dto.LastName))
            user.LastName = dto.LastName;

        if (!string.IsNullOrEmpty(dto.EmployeeCode))
            user.EmployeeCode = dto.EmployeeCode;

        if (dto.IsActive.HasValue)
            user.IsActive = dto.IsActive.Value;

        if (!string.IsNullOrEmpty(dto.PasswordHash))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.PasswordHash);

        await _context.SaveChangesAsync();

        var response = new UserResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            Role = "User",
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            EmployeeCode = user.EmployeeCode ?? "",
            IsActive = user.IsActive,
            IsEmailVerified = user.IsEmailVerified
        };

        return Ok(new { Success = true, Message = "User updated successfully", Data = response });
    }
}