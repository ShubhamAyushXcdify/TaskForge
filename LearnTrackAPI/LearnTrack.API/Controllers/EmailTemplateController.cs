using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
using Microsoft.EntityFrameworkCore;
using LearnTrack.Core.DTOs;

namespace LearnTrack.API.Controllers;

[Authorize(Roles = "Admin,admin")]
[ApiController]
[Route("api/[controller]")]
public class EmailTemplateController : ControllerBase
{
    private readonly AppDbContext _context;

    public EmailTemplateController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/EmailTemplate
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var templates = await _context.EmailTemplates
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Subject,
                t.Body,
                t.Description,
                t.IsActive,
                t.CreatedAt
            })
            .ToListAsync();

        return Ok(new { Success = true, Data = templates });
    }

    // GET: api/EmailTemplate/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var template = await _context.EmailTemplates.FindAsync(id);
        if (template == null)
            return NotFound(new { Success = false, Message = "Template not found" });

        return Ok(new { Success = true, Data = template });
    }

    // POST: api/EmailTemplate
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEmailTemplateDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { Success = false, Message = "Name is required" });

        if (await _context.EmailTemplates.AnyAsync(t => t.Name == dto.Name))
            return BadRequest(new { Success = false, Message = "Template with this name already exists" });

        var template = new EmailTemplate
        {
            Id          = Guid.NewGuid(),
            Name        = dto.Name,
            Subject     = dto.Subject,
            Body        = dto.Body,
            Description = dto.Description,
            IsActive    = dto.IsActive,
            CreatedAt   = DateTime.UtcNow
        };

        _context.EmailTemplates.Add(template);
        await _context.SaveChangesAsync();

        return StatusCode(201, new
        {
            Success = true,
            Data = new
            {
                template.Id,
                template.Name,
                template.Subject,
                template.Description,
                template.IsActive,
                template.CreatedAt
            }
        });
    }

    // PATCH: api/EmailTemplate/{id}
    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEmailTemplateDto dto)
    {
        var template = await _context.EmailTemplates.FindAsync(id);
        if (template == null)
            return NotFound(new { Success = false, Message = "Template not found" });

        if (!string.IsNullOrWhiteSpace(dto.Name))    template.Name        = dto.Name;
        if (!string.IsNullOrWhiteSpace(dto.Subject)) template.Subject     = dto.Subject;
        if (!string.IsNullOrWhiteSpace(dto.Body))    template.Body        = dto.Body;
        if (dto.Description != null)                  template.Description = dto.Description;
        if (dto.IsActive.HasValue)                    template.IsActive    = dto.IsActive.Value;

        template.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            Success = true,
            Data = new
            {
                template.Id,
                template.Name,
                template.Subject,
                template.Description,
                template.IsActive,
                template.UpdatedAt
            }
        });
    }

    // DELETE: api/EmailTemplate/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var template = await _context.EmailTemplates.FindAsync(id);
        if (template == null)
            return NotFound(new { Success = false, Message = "Template not found" });

        _context.EmailTemplates.Remove(template);
        await _context.SaveChangesAsync();

        return Ok(new { Success = true, Message = "Template deleted successfully" });
    }
}