using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using LearnTrack.Core.DTOs;

namespace LearnTrack.API.Controllers;

[Authorize(Roles = "Admin,admin")]
[ApiController]
[Route("api/admin/courses")]
public class AdminCourseController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminCourseController(AppDbContext context)
    {
        _context = context;
    }

   [HttpGet]
public async Task<IActionResult> GetAllCourses()
{
    // We project the data first. This avoids the column naming conflict 
    // because EF Core maps the properties explicitly.
    var courses = await _context.Courses
        .Select(course => new
        {
            course.Id,
            course.Title,
            // We use a null-check here to safely handle the Description
            Description = course.Description ?? "",
            Category = new { 
                Id = course.CourseCategoryId, 
                Name = course.Category != null ? course.Category.Name : "N/A" 
            },
            Provider = new { 
                Id = course.CourseProviderId, 
                Name = course.Provider != null ? course.Provider.Name : "N/A" 
            },
            course.DurationHours,
            course.IsActive,
            course.CreatedAt,
            // We calculate counts directly in SQL (very fast)
            AssignedCount = course.Assignments.Count(),
            CompletedCount = course.Assignments.Count(a => a.Status == "Completed"),
            InProgressCount = course.Assignments.Count(a => a.Status == "InProgress"),
            PendingCount = course.Assignments.Count(a => a.Status == "Pending" || a.Status == "Assigned")
        })
        .ToListAsync();

    // Now we calculate the CompletionRate in memory (C#) to stay safe
    var finalResult = courses.Select(c => new
    {
        c.Id,
        c.Title,
        c.Description,
        c.Category,
        c.Provider,
        c.DurationHours,
        c.IsActive,
        c.CreatedAt,
        Stats = new
        {
            Assigned = c.AssignedCount,
            Completed = c.CompletedCount,
            InProgress = c.InProgressCount,
            Pending = c.PendingCount,
            CompletionRate = c.AssignedCount > 0 
                ? Math.Round((double)c.CompletedCount / c.AssignedCount * 100, 2) 
                : 0
        }
    }).ToList();

    return Ok(new { Success = true, Data = finalResult });
}

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourseById(Guid id)
    {
        var course = await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Provider)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null)
            return NotFound(new { Success = false, Message = "Course not found" });

        var assignments = await (from a in _context.CourseAssignments
                                join emp in _context.Employees on a.EmployeeId equals emp.Id
                                where a.CourseId == id
                                select new
                                {
                                    AssignmentId = a.Id,
                                    EmployeeName = $"{emp.FirstName} {emp.LastName}",
                                    emp.EmployeeCode,
                                    a.Status,
                                    a.ProgressPercentage,
                                    a.StartDate,
                                    a.CompletionDate
                                }).ToListAsync();

        var response = new
        {
            course.Id,
            course.Title,
            course.Description,
            Category = new { Id = course.CourseCategoryId, Name = course.Category?.Name ?? "N/A" },
            Provider = new { Id = course.CourseProviderId, Name = course.Provider?.Name ?? "N/A" },
            course.DurationHours,
            course.IsActive,
            course.CreatedAt,
            Stats = new
            {
                Assigned = assignments.Count,
                Completed = assignments.Count(a => a.Status == "Completed"),
                InProgress = assignments.Count(a => a.Status == "InProgress"),
                Pending = assignments.Count(a => a.Status == "Pending" || a.Status == "Assigned")
            },
            Assignments = assignments
        };

        return Ok(new { Success = true, Data = response });
    }

    [HttpPost]
    public async Task<IActionResult> CreateCourse([FromBody] Course course)
    {
        if (course == null || string.IsNullOrEmpty(course.Title))
            return BadRequest(new { Success = false, Message = "Title is required" });

        course.Id = Guid.NewGuid();
        course.CreatedAt = DateTime.UtcNow;
        course.IsActive = true;

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
            course.CreatedBy = Guid.Parse(userId);

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCourseById), new { id = course.Id }, 
            new { Success = true, Message = "Course created successfully", Id = course.Id });
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateCourse(Guid id, [FromBody] Course updatedCourse)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null)
            return NotFound(new { Success = false, Message = "Course not found" });

        if (!string.IsNullOrEmpty(updatedCourse.Title)) course.Title = updatedCourse.Title;
        if (!string.IsNullOrEmpty(updatedCourse.Description)) course.Description = updatedCourse.Description;
        if (updatedCourse.DurationHours > 0) course.DurationHours = updatedCourse.DurationHours;
        if (updatedCourse.CourseCategoryId != Guid.Empty) course.CourseCategoryId = updatedCourse.CourseCategoryId;
        if (updatedCourse.CourseProviderId != Guid.Empty) course.CourseProviderId = updatedCourse.CourseProviderId;
        course.IsActive = updatedCourse.IsActive;

        await _context.SaveChangesAsync();
        return Ok(new { Success = true, Message = "Course updated successfully", Id = course.Id });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null)
            return NotFound(new { Success = false, Message = "Course not found" });

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();
        return Ok(new { Success = true, Message = "Course deleted successfully" });
    }
}