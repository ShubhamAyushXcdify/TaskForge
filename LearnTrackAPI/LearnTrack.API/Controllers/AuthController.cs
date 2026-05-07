using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LearnTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("Login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest login)
    {

        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == login.Email);

        // This line throws the 'SaltParseException' if the DB value is corrupted or plain text
        if (user == null || !BCrypt.Net.BCrypt.Verify(login.Password, user.PasswordHash))
        {
            return Unauthorized(new { success = false, message = "Invalid Credentials" });
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "User")
            }),
            Expires = DateTime.UtcNow.AddHours(Convert.ToDouble(_config["Jwt:expiryhours"])),
            Issuer = _config["Jwt:Issuer"],
            Audience = _config["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return Ok(new
        {
            success = true,
            message = "Login successful",
            token = tokenHandler.WriteToken(token),
            user = new UserResponseDto
            {
                UserId = user.Id,
                Email = user.Email,
                Role = user.Role?.Name ?? "User",
                FirstName = user.FirstName,
                LastName = user.LastName,
                EmployeeCode = user.EmployeeCode,
                IsActive = user.IsActive,
                IsEmailVerified = user.IsEmailVerified
            }
        });
    }
}

public class LoginRequest 
{ 
    public string Email { get; set; } = string.Empty; 
    public string Password { get; set; } = string.Empty; 
}