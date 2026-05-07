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

    // ✅ GET ALL USERS
    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .Include(u => u.Role)           // If you have navigation property
            .ToListAsync();

        var response = users.Select(user => new UserResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role?.Name ?? "N/A",     // Assuming Role has Name property
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            EmployeeCode = user.EmployeeCode ?? "",
            IsActive = user.IsActive,
            IsEmailVerified = user.IsEmailVerified
        }).ToList();

        return Ok(new 
        { 
            Success = true, 
            Message = "Users retrieved successfully",
            Data = response 
        });
    }

    // ✅ GET USER BY ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound(new { Success = false, Message = "User not found" });

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

        return Ok(new 
        { 
            Success = true, 
            Message = "User retrieved successfully",
            Data = response 
        });
    }

    // ✅ CREATE USER (Registration - Public)
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> CreateUser(User user)
    {
        if (user == null || string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.PasswordHash))
            return BadRequest(new { Success = false, Message = "Email and Password are required" });

        if (await _context.Users.AnyAsync(u => u.Email == user.Email))
            return BadRequest(new { Success = false, Message = "Email already exists" });

        user.Id = Guid.NewGuid();
        user.CreatedAt = DateTime.UtcNow;
        user.IsActive = true;
        user.IsEmailVerified = false;
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var responseDto = new UserResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            Role = "User",                    // Default role
            FirstName = user.FirstName ?? "",
            LastName = user.LastName ?? "",
            EmployeeCode = user.EmployeeCode ?? "",
            IsActive = user.IsActive,
            IsEmailVerified = user.IsEmailVerified
        };

        return Ok(new 
        { 
            Success = true, 
            Message = "User created successfully",
            Data = responseDto 
        });
    }

    // ✅ UPDATE USER
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, User updatedUser)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound(new { Success = false, Message = "User not found" });

        user.Email = updatedUser.Email;
        user.FirstName = updatedUser.FirstName;
        user.LastName = updatedUser.LastName;
        user.EmployeeCode = updatedUser.EmployeeCode;
        user.IsActive = updatedUser.IsActive;

        if (!string.IsNullOrEmpty(updatedUser.PasswordHash))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updatedUser.PasswordHash);
        }

        await _context.SaveChangesAsync();

        // Reload to get updated data
        var updated = await _context.Users.FindAsync(id);

        var responseDto = new UserResponseDto
        {
            UserId = updated.Id,
            Email = updated.Email,
            Role = "Updated", // You can improve this later
            FirstName = updated.FirstName ?? "",
            LastName = updated.LastName ?? "",
            EmployeeCode = updated.EmployeeCode ?? "",
            IsActive = updated.IsActive,
            IsEmailVerified = updated.IsEmailVerified
        };

        return Ok(new 
        { 
            Success = true, 
            Message = "User updated successfully",
            Data = responseDto 
        });
    }

    // ✅ DELETE USER
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound(new { Success = false, Message = "User not found" });

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { Success = true, Message = "User deleted successfully" });
    }
}