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
public class CourseProviderController : ControllerBase
{
    private readonly AppDbContext _context;

    public CourseProviderController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/CourseProvider
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var providers = await _context.CourseProviders
            .Select(p => new
            {
                Id           = p.Id,
                Name         = p.Name,
                Website      = p.Website,
                TotalCourses = _context.Courses.Count(c => c.CourseProviderId == p.Id)
            })
            .ToListAsync();

        return Ok(new { Success = true, Data = providers });
    }

    // GET: api/CourseProvider/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var provider = await _context.CourseProviders
            .Where(p => p.Id == id)
            .Select(p => new
            {
                Id           = p.Id,
                Name         = p.Name,
                Website      = p.Website,
                TotalCourses = _context.Courses.Count(c => c.CourseProviderId == p.Id)
            })
            .FirstOrDefaultAsync();

        if (provider == null)
            return NotFound(new { Success = false, Message = "Provider not found" });

        return Ok(new { Success = true, Data = provider });
    }

    // POST: api/CourseProvider
    [Authorize(Roles = "Admin,admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCourseProviderDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { Success = false, Message = "Name is required" });

        if (await _context.CourseProviders.AnyAsync(p => p.Name == dto.Name))
            return BadRequest(new { Success = false, Message = "Provider already exists" });

        var provider = new CourseProvider
        {
            Id        = Guid.NewGuid(),
            Name      = dto.Name,
            Website   = dto.Website,
            CreatedAt = DateTime.UtcNow
        };

        _context.CourseProviders.Add(provider);
        await _context.SaveChangesAsync();

        return StatusCode(201, new
        {
            Success = true,
            Data = new
            {
                provider.Id,
                provider.Name,
                provider.Website,
                TotalCourses = 0
            }
        });
    }

    // PATCH: api/CourseProvider/{id}
    [Authorize(Roles = "Admin,admin")]
    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCourseProviderDto dto)
    {
        var provider = await _context.CourseProviders.FindAsync(id);
        if (provider == null)
            return NotFound(new { Success = false, Message = "Provider not found" });

        if (!string.IsNullOrWhiteSpace(dto.Name))    provider.Name    = dto.Name;
        if (dto.Website != null)                      provider.Website = dto.Website;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Success = true,
            Data = new
            {
                provider.Id,
                provider.Name,
                provider.Website
            }
        });
    }

    // DELETE: api/CourseProvider/{id}
    [Authorize(Roles = "Admin,admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var provider = await _context.CourseProviders.FindAsync(id);
        if (provider == null)
            return NotFound(new { Success = false, Message = "Provider not found" });

        var hasCourses = await _context.Courses.AnyAsync(c => c.CourseProviderId == id);
        if (hasCourses)
            return BadRequest(new { Success = false, Message = "Cannot delete provider with existing courses" });

        _context.CourseProviders.Remove(provider);
        await _context.SaveChangesAsync();

        return Ok(new { Success = true, Message = "Provider deleted successfully" });
    }
}