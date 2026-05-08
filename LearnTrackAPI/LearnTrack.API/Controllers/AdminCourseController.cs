using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using LearnTrack.Core.DTOs;

namespace LearnTrack.API.Controllers;

[Authorize(Roles = "Admin")]
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
        var courses = await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Provider)
            .Include(c => c.Assignments)
            .Select(course => new
            {
                course.Id,
                course.Title,
                course.Description,
                Category = new { Id = course.CourseCategoryId, Name = course.Category != null ? course.Category.Name : "N/A" },
                Provider = new { Id = course.CourseProviderId, Name = course.Provider != null ? course.Provider.Name : "N/A" },
                course.DurationHours,
                course.IsActive,
                course.CreatedAt,
                Stats = new
                {
                    Assigned = course.Assignments.Count,
                    Completed = course.Assignments.Count(a => a.Status == "Completed"),
                    InProgress = course.Assignments.Count(a => a.Status == "InProgress"),
                    Pending = course.Assignments.Count(a => a.Status == "Pending" || a.Status == "Assigned"),
                    CompletionRate = course.Assignments.Any() 
                        ? Math.Round((double)course.Assignments.Count(a => a.Status == "Completed") / course.Assignments.Count * 100, 2) 
                        : 0
                }
            }).ToListAsync();

        return Ok(new { Success = true, Data = courses });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourseById(Guid id)
    {
        // 1. Fetch Course with basic info
        var course = await _context.Courses
            .Include(c => c.Category)
            .Include(c => c.Provider)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null)
            return NotFound(new { Success = false, Message = "Course not found" });

        // 2. Fetch Assignments with an explicit Join to Employee to avoid the Collection error
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