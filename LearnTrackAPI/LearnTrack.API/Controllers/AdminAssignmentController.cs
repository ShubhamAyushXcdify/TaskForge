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
        var query = from a in _context.CourseAssignments
                    join e in _context.Employees on a.EmployeeId equals e.Id
                    join c in _context.Courses on a.CourseId equals c.Id
                    join cat in _context.CourseCategories on c.CourseCategoryId equals cat.Id
                    select new
                    {
                        assignmentId = a.Id,
                        employeeId = e.Id,
                        employeeName = e.FirstName + " " + e.LastName,
                        employeeCode = e.EmployeeCode,
                        courseId = c.Id,
                        courseTitle = c.Title,
                        category = cat.Name,
                        status = a.Status,
                        progressPercentage = a.ProgressPercentage,
                        // ✅ FIX: Referencing 'a' (Assignment table) for dates
                        dueDate = a.DueDate,
                        startedAt = a.StartDate,
                        completedAt = a.CompletionDate,
                        lastAccessedAt = a.LastAccessedAt
                    };

        var result = await query.ToListAsync();
        return Ok(new { assignments = result, total = result.Count });
    }

    // 2. GET: api/admin/assignments/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAssignmentById(Guid id)
    {
        var assignment = await (from a in _context.CourseAssignments
                                join e in _context.Employees on a.EmployeeId equals e.Id
                                join u in _context.Users on e.UserId equals u.Id
                                join c in _context.Courses on a.CourseId equals c.Id
                                join cat in _context.CourseCategories on c.CourseCategoryId equals cat.Id
                                join p in _context.CourseProviders on c.CourseProviderId equals p.Id
                                where a.Id == id
                                select new
                                {
                                    assignmentId = a.Id,
                                    employee = new { e.Id, Name = e.FirstName + " " + e.LastName, e.EmployeeCode, u.Email },
                                    course = new { c.Id, Title = c.Title, Category = cat.Name, c.DurationHours, Provider = p.Name },
                                    status = a.Status,
                                    progressPercentage = a.ProgressPercentage,
                                    // ✅ FIX: Referencing 'a' (Assignment table) for dates
                                    dueDate = a.DueDate,
                                    startedAt = a.StartDate,
                                    completedAt = a.CompletionDate,
                                    lastAccessedAt = a.LastAccessedAt
                                }).FirstOrDefaultAsync();

        if (assignment == null) return NotFound(new { message = "Assignment not found" });
        return Ok(assignment);
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

    // 4. PATCH: api/admin/assignments/{id} (Partial Update)
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