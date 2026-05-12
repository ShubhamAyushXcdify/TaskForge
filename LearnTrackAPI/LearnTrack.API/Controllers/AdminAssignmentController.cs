using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
using LearnTrack.Core.DTOs;

namespace LearnTrack.API.Controllers;

[Authorize(Roles = "Admin,admin")]
[ApiController]
[Route("api/admin/assignments")]
public class AdminAssignmentController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminAssignmentController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/admin/assignments
    [HttpGet]
    public async Task<IActionResult> GetAllAssignments()
    {
        var data = await _context.CourseAssignments
            .Include(a => a.Course)
                .ThenInclude(c => c!.CourseCategory)
            .Include(a => a.Course)
                .ThenInclude(c => c!.CourseProvider)
            .Include(a => a.Employee)
            .ToListAsync();

        var assignments = data.Select(a => new
        {
            AssignmentId      = a.Id,
            CourseId          = a.CourseId,
            CourseTitle       = a.Course?.Title ?? "N/A",
            Category          = a.Course?.CourseCategory?.Name ?? "N/A",
            ProviderName      = a.Course?.CourseProvider?.Name ?? "N/A",
            EmployeeId        = a.EmployeeId,
            EmployeeName      = a.Employee != null ? $"{a.Employee.FirstName} {a.Employee.LastName}".Trim() : "N/A",
            EmployeeCode      = a.Employee?.EmployeeCode ?? "N/A",
            Status            = a.Status ?? "Unknown",
            ProgressPercentage = a.ProgressPercentage,
            DueDate           = a.DueDate,
            StartedAt         = a.StartDate,
            CompletedAt       = a.CompletionDate,
            LastAccessedAt    = a.LastAccessedAt,
            CreatedAt         = a.CreatedAt
        }).ToList();

        return Ok(new { Success = true, Assignments = assignments, Total = assignments.Count });
    }

    // GET: api/admin/assignments/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAssignmentById(Guid id)
    {
        var a = await _context.CourseAssignments
            .Include(a => a.Course)
                .ThenInclude(c => c!.CourseCategory)
            .Include(a => a.Course)
                .ThenInclude(c => c!.CourseProvider)
            .Include(a => a.Employee)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (a == null)
            return NotFound(new { Success = false, Message = "Assignment not found" });

        return Ok(new { Success = true, Data = new
        {
            AssignmentId       = a.Id,
            CourseId           = a.CourseId,
            CourseTitle        = a.Course?.Title ?? "N/A",
            Category           = a.Course?.CourseCategory?.Name ?? "N/A",
            ProviderName       = a.Course?.CourseProvider?.Name ?? "N/A",
            EmployeeId         = a.EmployeeId,
            EmployeeName       = a.Employee != null ? $"{a.Employee.FirstName} {a.Employee.LastName}".Trim() : "N/A",
            EmployeeCode       = a.Employee?.EmployeeCode ?? "N/A",
            Status             = a.Status ?? "Unknown",
            ProgressPercentage = a.ProgressPercentage,
            DueDate            = a.DueDate,
            StartedAt          = a.StartDate,
            CompletedAt        = a.CompletionDate,
            LastAccessedAt     = a.LastAccessedAt,
            CreatedAt          = a.CreatedAt
        }});
    }

    // POST: api/admin/assignments
    // POST: api/admin/assignments
[HttpPost]
public async Task<IActionResult> AssignCourse([FromBody] CreateAssignmentDto dto)
{
    if (dto == null || dto.EmployeeIds == null || !dto.EmployeeIds.Any())
        return BadRequest(new { Success = false, Message = "At least one employee is required" });

    var course = await _context.Courses.FindAsync(dto.CourseId);
    if (course == null)
        return NotFound(new { Success = false, Message = "Course not found" });

    var results = new List<object>();

    foreach (var employeeId in dto.EmployeeIds)
    {
        var employee = await _context.Employees.FindAsync(employeeId);
        if (employee == null)
        {
            results.Add(new { EmployeeId = employeeId, Success = false, Message = "Employee not found" });
            continue;
        }

        var exists = await _context.CourseAssignments
            .AnyAsync(a => a.EmployeeId == employeeId && a.CourseId == dto.CourseId);
        if (exists)
        {
            results.Add(new { EmployeeId = employeeId, Success = false, Message = "Already assigned" });
            continue;
        }

        var assignment = new CourseAssignment
        {
            Id                 = Guid.NewGuid(),
            EmployeeId         = employeeId,
            CourseId           = dto.CourseId,
            Status             = "Assigned",
            ProgressPercentage = 0,
            DueDate            = dto.DueDate,
            CreatedAt          = DateTime.UtcNow
        };

        _context.CourseAssignments.Add(assignment);
        results.Add(new { EmployeeId = employeeId, Success = true, Message = "Assigned successfully" });
    }

    await _context.SaveChangesAsync();
    return Ok(new { Success = true, Results = results });
}

    // PATCH: api/admin/assignments/{id}
    // PATCH: api/admin/assignments/{id}
[HttpPatch("{id}")]
public async Task<IActionResult> UpdateAssignment(Guid id, [FromBody] UpdateAssignmentDto dto)
{
    var assignment = await _context.CourseAssignments.FindAsync(id);
    if (assignment == null)
        return NotFound(new { Success = false, Message = "Assignment not found" });

    if (dto.ProgressPercentage.HasValue)
        assignment.ProgressPercentage = (decimal)dto.ProgressPercentage.Value;

    if (!string.IsNullOrEmpty(dto.Status))
        assignment.Status = dto.Status;

    if (dto.LastAccessedAt.HasValue)
        assignment.LastAccessedAt = dto.LastAccessedAt;

    assignment.UpdatedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();

    return Ok(new { Success = true, Message = "Assignment updated successfully" });
}

    // PATCH: api/admin/assignments/{id}/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateAssignmentStatusDto dto)
    {
        var assignment = await _context.CourseAssignments.FindAsync(id);
        if (assignment == null)
            return NotFound(new { Success = false, Message = "Assignment not found" });

        assignment.Status    = dto.Status;
        assignment.UpdatedAt = DateTime.UtcNow;

        // Auto-set dates based on status
        if (dto.Status == "InProgress" && assignment.StartDate == null)
            assignment.StartDate = DateTime.UtcNow;

        if (dto.Status == "Completed")
        {
            assignment.CompletionDate      = DateTime.UtcNow;
            assignment.ProgressPercentage  = 100;
        }

        await _context.SaveChangesAsync();

        return Ok(new { Success = true, Message = $"Assignment status updated to {dto.Status}" });
    }

    // DELETE: api/admin/assignments/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAssignment(Guid id)
    {
        var assignment = await _context.CourseAssignments.FindAsync(id);
        if (assignment == null)
            return NotFound(new { Success = false, Message = "Assignment not found" });

        _context.CourseAssignments.Remove(assignment);
        await _context.SaveChangesAsync();

        return Ok(new { Success = true, Message = "Assignment deleted successfully" });
    }
}