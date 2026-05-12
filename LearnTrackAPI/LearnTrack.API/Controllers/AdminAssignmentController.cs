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

    // 1. GET: api/admin/assignments
    [HttpGet]
    public async Task<IActionResult> GetAllAssignments()
    {
        var result = await _context.CourseAssignments
            .Include(a => a.Employee)
            .Include(a => a.Course)
                .ThenInclude(c => c!.CourseCategory)
            .Select(a => new
            {
                assignmentId = a.Id,
                employeeId = a.EmployeeId,
                employeeName = a.Employee != null ? a.Employee.FirstName + " " + a.Employee.LastName : "N/A",
                employeeCode = a.Employee != null ? a.Employee.EmployeeCode : "N/A",
                courseId = a.CourseId,
                courseTitle = a.Course != null ? a.Course.Title : "N/A",
                // ✅ Matches the CourseCategory property in Course.cs
                category = a.Course != null && a.Course.CourseCategory != null ? a.Course.CourseCategory.Name : "N/A",
                status = a.Status,
                progressPercentage = a.ProgressPercentage,
                dueDate = a.DueDate,
                startedAt = a.StartDate,
                completedAt = a.CompletionDate,
                lastAccessedAt = a.LastAccessedAt
            })
            .ToListAsync();

        return Ok(new { assignments = result, total = result.Count });
    }

    // 2. GET: api/admin/assignments/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAssignmentById(Guid id)
    {
        var a = await _context.CourseAssignments
            .Include(a => a.Employee)
                .ThenInclude(e => e!.User)
            .Include(a => a.Course)
                .ThenInclude(c => c!.CourseCategory)
            .Include(a => a.Course)
                .ThenInclude(c => c!.CourseProvider)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (a == null) return NotFound(new { message = "Assignment not found" });

        var response = new
        {
            assignmentId = a.Id,
            employee = new { a.Employee?.Id, Name = a.Employee?.FirstName + " " + a.Employee?.LastName, a.Employee?.EmployeeCode, a.Employee?.User?.Email },
            course = new { a.Course?.Id, a.Course?.Title, Category = a.Course?.CourseCategory?.Name, a.Course?.DurationHours, Provider = a.Course?.CourseProvider?.Name },
            status = a.Status,
            progressPercentage = a.ProgressPercentage,
            dueDate = a.DueDate,
            startedAt = a.StartDate,
            completedAt = a.CompletionDate,
            lastAccessedAt = a.LastAccessedAt
        };

        return Ok(response);
    }

    // 3. POST: api/admin/assignments (Bulk Assign)
    [HttpPost]
    public async Task<IActionResult> AssignCourse([FromBody] CreateAssignmentDto dto)
    {
        var course = await _context.Courses.FindAsync(dto.CourseId);
        if (course == null) return BadRequest("Invalid Course ID");

        var newAssignments = new List<object>();

        foreach (var empId in dto.EmployeeIds)
        {
            var employee = await _context.Employees.FindAsync(empId);
            if (employee == null) continue;

            var assignment = new CourseAssignment
            {
                Id = Guid.NewGuid(),
                EmployeeId = empId,
                CourseId = dto.CourseId,
                Status = "Assigned",
                ProgressPercentage = 0,
                DueDate = dto.DueDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.CourseAssignments.Add(assignment);
            
            newAssignments.Add(new {
                assignmentId = assignment.Id,
                employeeId = empId,
                employeeName = employee.FirstName + " " + employee.LastName,
                courseId = course.Id,
                courseTitle = course.Title,
                status = assignment.Status,
                progressPercentage = 0,
                dueDate = assignment.DueDate,
                createdAt = assignment.CreatedAt
            });
        }

        await _context.SaveChangesAsync();
        return Ok(new { assigned = newAssignments, totalAssigned = newAssignments.Count });
    }

    // 4. PATCH: api/admin/assignments/{id}
    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateAssignment(Guid id, [FromBody] UpdateAssignmentDto dto)
    {
        var assignment = await _context.CourseAssignments.FindAsync(id);
        if (assignment == null) return NotFound();

        if (dto.ProgressPercentage.HasValue) assignment.ProgressPercentage = dto.ProgressPercentage.Value;
        if (!string.IsNullOrEmpty(dto.Status)) assignment.Status = dto.Status;
        if (dto.LastAccessedAt.HasValue) assignment.LastAccessedAt = dto.LastAccessedAt;

        assignment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { 
            assignmentId = assignment.Id, 
            status = assignment.Status, 
            progressPercentage = assignment.ProgressPercentage, 
            updatedAt = assignment.UpdatedAt 
        });
    }

    // 5. PATCH: api/admin/assignments/{id}/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateAssignmentStatusDto dto)
    {
        var assignment = await _context.CourseAssignments.FindAsync(id);
        if (assignment == null) return NotFound();

        assignment.Status = dto.Status;
        assignment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { 
            assignmentId = assignment.Id, 
            status = assignment.Status, 
            updatedAt = assignment.UpdatedAt 
        });
    }

    // 6. DELETE: api/admin/assignments/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAssignment(Guid id)
    {
        var assignment = await _context.CourseAssignments.FindAsync(id);
        if (assignment == null) return NotFound();

        _context.CourseAssignments.Remove(assignment);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Assignment deleted successfully" });
    }
}