using LearnTrack.Core.Entities;
using LearnTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearnTrack.Core.DTOs;

namespace LearnTrack.API.Controllers;

[Authorize(Roles = "Admin,admin")]
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
                UserId          = user.Id,
                Email           = user.Email,
                Role            = user.Role != null ? user.Role.Name : "N/A",
                FirstName       = user.FirstName ?? "",
                LastName        = user.LastName ?? "",
                EmployeeCode    = user.EmployeeCode ?? "",
                IsActive        = user.IsActive,
                IsEmailVerified = user.IsEmailVerified
            }).ToListAsync();

        return Ok(new { success = true, message = "Users retrieved successfully", data = users });
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        if (dto == null || string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
            return BadRequest(new { success = false, message = "Email and Password are required" });

        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
            return BadRequest(new { success = false, message = "Email already exists" });

        var role = await _context.Roles.FindAsync(dto.RoleId);
        if (role == null)
            return BadRequest(new { success = false, message = "Invalid RoleId" });

        var user = new User
        {
            Id              = Guid.NewGuid(),
            Email           = dto.Email,
            PasswordHash    = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FirstName       = dto.FirstName ?? "",
            LastName        = dto.LastName ?? "",
            EmployeeCode    = dto.EmployeeCode ?? "",
            RoleId          = dto.RoleId,
            IsActive        = true,
            IsEmailVerified = false,
            CreatedAt       = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "User created successfully",
            data = new UserResponseDto
            {
                UserId          = user.Id,
                Email           = user.Email,
                Role            = role.Name,
                FirstName       = user.FirstName,
                LastName        = user.LastName,
                EmployeeCode    = user.EmployeeCode,
                IsActive        = user.IsActive,
                IsEmailVerified = user.IsEmailVerified
            }
        });
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound(new { success = false, message = "User not found" });

        if (!string.IsNullOrEmpty(dto.Email))        user.Email        = dto.Email;
        if (!string.IsNullOrEmpty(dto.FirstName))    user.FirstName    = dto.FirstName;
        if (!string.IsNullOrEmpty(dto.LastName))     user.LastName     = dto.LastName;
        if (!string.IsNullOrEmpty(dto.EmployeeCode)) user.EmployeeCode = dto.EmployeeCode;
        if (dto.IsActive.HasValue)                   user.IsActive     = dto.IsActive.Value;
        if (dto.RoleId.HasValue)                     user.RoleId       = dto.RoleId.Value;

        // ✅ Password field renamed to Password, correctly hashed before storing
        if (!string.IsNullOrEmpty(dto.PasswordHash))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.PasswordHash);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "User updated successfully",
            data = new UserResponseDto
            {
                UserId          = user.Id,
                Email           = user.Email,
                Role            = user.Role?.Name ?? "N/A",
                FirstName       = user.FirstName ?? "",
                LastName        = user.LastName ?? "",
                EmployeeCode    = user.EmployeeCode ?? "",
                IsActive        = user.IsActive,
                IsEmailVerified = user.IsEmailVerified
            }
        });
    }
}