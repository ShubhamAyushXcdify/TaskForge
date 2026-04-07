using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace LearnTrack.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RoleController : ControllerBase
{
    private readonly AppDbContext _context;

    public RoleController(AppDbContext context)
    {
        _context = context;
    }

    // STEP 1: CREATE ROLES (Admin, Manager, Employee)
    [HttpPost]
    public async Task<IActionResult> CreateRole([FromBody] Role role)
    {
        if (role.Id == Guid.Empty)
        {
            role.Id = Guid.NewGuid();
        }

        _context.Roles.Add(role);
        await _context.SaveChangesAsync();
        return Ok(role);
    }

    // Helper to verify roles during demo
    [HttpGet]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _context.Roles.ToListAsync();
        return Ok(roles);
    }
    //Get By Id
    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoleById(Guid id)
    {
        var role = await _context.Roles.FindAsync(id);

        if (role == null)
            return NotFound("Role not found");

        return Ok(role);
    }
    //Update Role
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRole(Guid id, Role updatedRole)
    {
        var role = await _context.Roles.FindAsync(id);

        if (role == null)
            return NotFound("Role not found");

        role.Name = updatedRole.Name;

        await _context.SaveChangesAsync();

        return Ok(role);
    }
    //Delete Role by Id
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRole(Guid id)
    {
        var role = await _context.Roles.FindAsync(id);

        if (role == null)
            return NotFound("Role not found");

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();

        return Ok("Role deleted successfully");
    }
}