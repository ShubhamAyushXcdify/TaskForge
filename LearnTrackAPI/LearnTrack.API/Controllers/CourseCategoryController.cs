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

    // GET: api/CourseCategory
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _context.CourseCategories
            .Select(c => new
            {
                Id          = c.Id,
                Name        = c.Name,
                Description = c.Description,
                TotalCourses = _context.Courses.Count(course => course.CourseCategoryId == c.Id)
            })
            .ToListAsync();

        return Ok(new { Success = true, Data = categories });
    }

    // GET: api/CourseCategory/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var category = await _context.CourseCategories
            .Where(c => c.Id == id)
            .Select(c => new
            {
                Id           = c.Id,
                Name         = c.Name,
                Description  = c.Description,
                TotalCourses = _context.Courses.Count(course => course.CourseCategoryId == c.Id)
            })
            .FirstOrDefaultAsync();

        if (category == null)
            return NotFound(new { Success = false, Message = "Category not found" });

        return Ok(new { Success = true, Data = category });
    }

    // POST: api/CourseCategory
    [Authorize(Roles = "Admin,admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCourseCategoryDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { Success = false, Message = "Name is required" });

        if (await _context.CourseCategories.AnyAsync(c => c.Name == dto.Name))
            return BadRequest(new { Success = false, Message = "Category already exists" });

        var category = new CourseCategory
        {
            Id          = Guid.NewGuid(),
            Name        = dto.Name,
            Description = dto.Description,
            CreatedAt   = DateTime.UtcNow
        };

        _context.CourseCategories.Add(category);
        await _context.SaveChangesAsync();

        return StatusCode(201, new
        {
            Success = true,
            Data = new
            {
                category.Id,
                category.Name,
                category.Description,
                TotalCourses = 0
            }
        });
    }

    // PATCH: api/CourseCategory/{id}
    [Authorize(Roles = "Admin,admin")]
    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCourseCategoryDto dto)
    {
        var category = await _context.CourseCategories.FindAsync(id);
        if (category == null)
            return NotFound(new { Success = false, Message = "Category not found" });

        if (!string.IsNullOrWhiteSpace(dto.Name))        category.Name        = dto.Name;
        if (dto.Description != null)                      category.Description = dto.Description;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Success = true,
            Data = new
            {
                category.Id,
                category.Name,
                category.Description
            }
        });
    }

    // DELETE: api/CourseCategory/{id}
    [Authorize(Roles = "Admin,admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var category = await _context.CourseCategories.FindAsync(id);
        if (category == null)
            return NotFound(new { Success = false, Message = "Category not found" });

        var hasCourses = await _context.Courses.AnyAsync(c => c.CourseCategoryId == id);
        if (hasCourses)
            return BadRequest(new { Success = false, Message = "Cannot delete category with existing courses" });

        _context.CourseCategories.Remove(category);
        await _context.SaveChangesAsync();

        return Ok(new { Success = true, Message = "Category deleted successfully" });
    }
}