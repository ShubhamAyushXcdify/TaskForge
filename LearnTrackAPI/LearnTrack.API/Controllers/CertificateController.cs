using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearnTrack.Infrastructure.Data;

namespace LearnTrack.API.Controllers;

[Authorize]
[ApiController]
[Route("api/assignments")]
public class CertificateController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public CertificateController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // POST: api/assignments/{assignmentId}/certificate
    [HttpPost("{assignmentId}/certificate")]
    public async Task<IActionResult> UploadCertificate(Guid assignmentId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { Success = false, Message = "No file uploaded" });

        // Validate file type
        var allowedTypes = new[] { "application/pdf", "image/jpeg", "image/png", "image/jpg" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { Success = false, Message = "Only PDF, JPG, and PNG files are allowed" });

        // Validate file size (max 10MB)
        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(new { Success = false, Message = "File size must be under 10MB" });

        var assignment = await _context.CourseAssignments
            .Include(a => a.Course)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null)
            return NotFound(new { Success = false, Message = "Assignment not found" });

        // Save file to wwwroot/certificates/
        var certificatesFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "certificates");
        if (!Directory.Exists(certificatesFolder))
            Directory.CreateDirectory(certificatesFolder);

        var fileExtension = Path.GetExtension(file.FileName);
        var fileName = $"{assignmentId}_{DateTime.UtcNow:yyyyMMddHHmmss}{fileExtension}";
        var filePath = Path.Combine(certificatesFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Build public URL
        var request = HttpContext.Request;
        var certificateUrl = $"{request.Scheme}://{request.Host}/certificates/{fileName}";

        // Update assignment
        assignment.CertificateUrl      = certificateUrl;
        assignment.Status              = "Completed";
        assignment.ProgressPercentage  = 100;
        assignment.CompletionDate      = DateTime.UtcNow;
        assignment.UpdatedAt           = DateTime.UtcNow;

        if (assignment.StartDate == null)
            assignment.StartDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Success        = true,
            Message        = "Certificate uploaded and assignment marked as Completed",
            AssignmentId   = assignment.Id,
            CourseTitle    = assignment.Course?.Title,
            CertificateUrl = certificateUrl,
            Status         = assignment.Status,
            CompletedAt    = assignment.CompletionDate
        });
    }

    // GET: api/assignments/{assignmentId}/certificate
    [HttpGet("{assignmentId}/certificate")]
    public async Task<IActionResult> GetCertificate(Guid assignmentId)
    {
        var assignment = await _context.CourseAssignments
            .Include(a => a.Course)
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null)
            return NotFound(new { Success = false, Message = "Assignment not found" });

        if (string.IsNullOrEmpty(assignment.CertificateUrl))
            return NotFound(new { Success = false, Message = "No certificate uploaded for this assignment" });

        return Ok(new
        {
            Success        = true,
            AssignmentId   = assignment.Id,
            CourseTitle    = assignment.Course?.Title,
            CertificateUrl = assignment.CertificateUrl,
            Status         = assignment.Status,
            CompletedAt    = assignment.CompletionDate
        });
    }
}