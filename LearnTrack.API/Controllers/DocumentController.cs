using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
using System.Security.Claims;

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

    // ✅ UPLOAD DOCUMENT
    [Authorize(Roles = "Admin,Manager")]
    [HttpPost]
    public async Task<IActionResult> Upload([FromForm] DocumentUploadRequest request)
    {
        if (request.File == null || request.File.Length == 0)
            return BadRequest("File is required");

        using var ms = new MemoryStream();
        await request.File.CopyToAsync(ms);

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        var document = new Document
        {
            Id = Guid.NewGuid(),
            EmployeeId = request.EmployeeId,
            CourseAssignmentId = request.AssignmentId,
            FileName = request.File.FileName,
            FileType = request.File.ContentType,
            Content = ms.ToArray(),
            UploadedBy = userId != null ? Guid.Parse(userId) : Guid.Empty,
            CreatedAt = DateTime.UtcNow
        };

        _context.Documents.Add(document);
        await _context.SaveChangesAsync();

        return Ok("Document uploaded successfully");
    }

    // ✅ GET ALL DOCUMENTS
    [Authorize(Roles = "Admin,Manager,Employee")]
    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_context.Documents.ToList());
    }
}