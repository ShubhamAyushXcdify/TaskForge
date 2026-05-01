using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using LearnTrack.API.DTOs;

namespace LearnTrack.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("Profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();
        
        var userId = Guid.Parse(userIdClaim);

        var user = await (from u in _context.Users
                          join r in _context.Roles on u.RoleId equals r.Id
                          where u.Id == userId
                          select new EmployeeListItemDto
                          {
                              Id = u.Id,
                              EmployeeCode = u.EmployeeCode ?? "N/A",
                              FullName = $"{u.FirstName} {u.LastName}",
                              Email = u.Email,
                              Role = r.Name,
                              IsActive = u.IsActive
                          }).FirstOrDefaultAsync();

        if (user == null) return NotFound(new { Success = false, Message = "User profile not found" });

        return Ok(new { Success = true, Data = user });
    }
}