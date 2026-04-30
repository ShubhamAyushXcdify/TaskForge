using LearnTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
[ApiController]
public class RoleController : ControllerBase
{
    private readonly AppDbContext _context;

    public RoleController(AppDbContext context)
    {
        _context = context;
    }

    // ✅ GET ALL ROLES
    [HttpGet]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _context.Roles.ToListAsync();
        return Ok(roles);
    }

    // OPTIONAL
    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoleById(Guid id)
    {
        var role = await _context.Roles.FindAsync(id);

        if (role == null)
            return NotFound("Role not found");

        return Ok(role);
    }
}