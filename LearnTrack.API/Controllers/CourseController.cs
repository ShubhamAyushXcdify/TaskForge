using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LearnTrack.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CourseController : ControllerBase
{
    private readonly AppDbContext _context;

    public CourseController(AppDbContext context)
    {
        _context = context;
    }

    // CREATE
    [Authorize(Roles = "Manager,Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(Course course)
    {
        // ✅ Validate Provider
        var providerExists = await _context.CourseProviders
            .AnyAsync(x => x.Id == course.CourseProviderId);

        if (!providerExists)
            return BadRequest("Invalid CourseProviderId");

        // ✅ Validate Category
        var categoryExists = await _context.CourseCategories
            .AnyAsync(x => x.Id == course.CourseCategoryId);

        if (!categoryExists)
            return BadRequest("Invalid CourseCategoryId");

        // ✅ Set values
        course.Id = Guid.NewGuid();
        course.CreatedAt = DateTime.UtcNow;
        course.IsActive = true;

        // 🔐 Get UserId from JWT
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        course.CreatedBy = Guid.Parse(userId!);

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return Ok(course);
    }
        
    // GET ALL
    [Authorize(Roles = "Admin,Manager,Employee")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _context.Courses.ToListAsync();
        return Ok(data);
    }
}