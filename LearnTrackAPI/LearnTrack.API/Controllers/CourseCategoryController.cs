using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
using Microsoft.EntityFrameworkCore;
using LearnTrack.Core.DTOs;

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

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _context.CourseCategories
            .Select(c => new CourseCategoryItemDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description
            })
            .ToListAsync();

        return Ok(new CourseCategoryResponseDto
        {
            Success = true,
            Data = categories
        });
    }

    [Authorize(Roles = "Admin,Manager")]
    [HttpPost]
    public async Task<IActionResult> Create(CourseCategory category)
    {
        category.Id = Guid.NewGuid();
        category.CreatedAt = DateTime.UtcNow;

        _context.CourseCategories.Add(category);
        await _context.SaveChangesAsync();
        
        return Ok(new { Success = true, Data = category });
    }
}