using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace LearnTrack.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DocumentController : ControllerBase
{
    private readonly AppDbContext _context;

    public DocumentController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var documents = await _context.Documents.ToListAsync();
        
        return Ok(new 
        { 
            Success = true, 
            Data = documents 
        });
    }

    [Authorize(Roles = "Admin,Manager")]
    [HttpPost]
    public async Task<IActionResult> Create(Document document)
    {
        document.Id = Guid.NewGuid();
        document.CreatedAt = DateTime.UtcNow;

        _context.Documents.Add(document);
        await _context.SaveChangesAsync();
        
        return Ok(new { Success = true, Data = document });
    }
}