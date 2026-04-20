using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace LearnTrack.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CourseProviderController : ControllerBase
{
    private readonly AppDbContext _context;

    public CourseProviderController(AppDbContext context)
    {
        _context = context;
    }

    // ✅ CREATE
    [Authorize(Roles = "Admin,Manager")]
    [HttpPost]
    public async Task<IActionResult> Create(CourseProvider provider)
    {
        provider.Id = Guid.NewGuid();
        provider.CreatedAt = DateTime.UtcNow;

        _context.CourseProviders.Add(provider);
        await _context.SaveChangesAsync();

        return Ok(provider);
    }

    // ✅ GET ALL
    [Authorize(Roles = "Admin,Manager,Employee")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _context.CourseProviders.ToListAsync();
        return Ok(data);
    }
}