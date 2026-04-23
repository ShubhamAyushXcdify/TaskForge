using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace LearnTrack.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CourseCategoryController : ControllerBase
{
    private readonly AppDbContext _context;

    public CourseCategoryController(AppDbContext context)
    {
        _context = context;
    }

    // CREATE

    [Authorize(Roles = "Admin,Manager")]
    [HttpPost]
    public async Task<IActionResult> Create(CourseCategory category)
    {
        category.Id = Guid.NewGuid();
        category.CreatedAt = DateTime.UtcNow;

        _context.CourseCategories.Add(category);
        await _context.SaveChangesAsync();

        return Ok(category);
    }

    // GET ALL

    [Authorize(Roles = "Admin,Manager,Employee")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _context.CourseCategories.ToListAsync();
        return Ok(data);
    }
}