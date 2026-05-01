using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
using Microsoft.EntityFrameworkCore;
using LearnTrack.API.DTOs;

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

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var providers = await _context.CourseProviders
            .Select(p => new CourseProviderItemDto
            {
                Id = p.Id,
                Name = p.Name,
                Website = p.Website // Ensure this property exists in your Entity!
            })
            .ToListAsync();

        return Ok(new CourseProviderResponseDto
        {
            Success = true,
            Data = providers
        });
    }

    [Authorize(Roles = "Admin,Manager")]
    [HttpPost]
    public async Task<IActionResult> Create(CourseProvider provider)
    {
        provider.Id = Guid.NewGuid();
        provider.CreatedAt = DateTime.UtcNow;

        _context.CourseProviders.Add(provider);
        await _context.SaveChangesAsync();
        
        return Ok(new { Success = true, Data = provider });
    }
}