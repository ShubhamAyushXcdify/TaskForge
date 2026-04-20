using LearnTrack.Core.Entities;
using LearnTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LearnTrack.API.Controllers;
[Authorize(Roles ="Admin")]
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
        var users = await _context.Users.ToListAsync();
        return Ok(users);
    }

    // ✅ GET USER BY ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound("User not found");

        return Ok(user);
    }

    // ✅ CREATE USER
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> CreateUser(User user)
    {
        if (user == null)
            return BadRequest("Invalid data");

        user.Id = Guid.NewGuid(); // ensure id
        user.CreatedAt = DateTime.UtcNow;
        user.IsActive = true;
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(user);
    }

    // ✅ UPDATE USER
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, User updatedUser)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound("User not found");

        user.Email = updatedUser.Email;
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updatedUser.PasswordHash);
        user.RoleId = updatedUser.RoleId;
        user.IsActive = updatedUser.IsActive;

        await _context.SaveChangesAsync();

        return Ok(user);
    }

    // ✅ DELETE USER
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound("User not found");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok("User deleted successfully");
    }
}