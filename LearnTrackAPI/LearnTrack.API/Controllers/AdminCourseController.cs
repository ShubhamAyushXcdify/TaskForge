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

    // GET: api/admin/courses
    [HttpGet]
    public async Task<IActionResult> GetAllCourses()
    {
        var courses = await _context.Courses
            .Include(c => c.CourseCategory)
            .Include(c => c.CourseProvider)
            .Include(c => c.Assignments)
            .Select(course => new
            {
                course.Id,
                course.Title,
                course.CourseUrl,
                Description = course.Description ?? "",
                Category = new
                {
                    Id   = course.CourseCategoryId,
                    Name = course.CourseCategory != null ? course.CourseCategory.Name : "N/A"
                },
                Provider = new
                {
                    Id   = course.CourseProviderId,
                    Name = course.CourseProvider != null ? course.CourseProvider.Name : "N/A"
                },
                course.DurationHours,
                course.IsActive,
                course.CreatedAt,
                AssignedCount   = course.Assignments.Count(),
                CompletedCount  = course.Assignments.Count(a => a.Status == "Completed"),
                InProgressCount = course.Assignments.Count(a => a.Status == "InProgress"),
                PendingCount    = course.Assignments.Count(a => a.Status == "Pending" || a.Status == "Assigned")
            })
            .ToListAsync();

        var result = courses.Select(c => new
        {
            c.Id,
            c.Title,
            c.CourseUrl,        // ← THIS WAS MISSING
            c.Description,
            c.Category,
            c.Provider,
            c.DurationHours,
            c.IsActive,
            c.CreatedAt,
            Stats = new
            {
                Assigned       = c.AssignedCount,
                Completed      = c.CompletedCount,
                InProgress     = c.InProgressCount,
                Pending        = c.PendingCount,
                CompletionRate = c.AssignedCount > 0
                    ? Math.Round((double)c.CompletedCount / c.AssignedCount * 100, 2)
                    : 0
            }
        }).ToList();

        return Ok(new { Success = true, Data = result });
    }

    // GET: api/admin/courses/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourseById(Guid id)
    {
        var course = await _context.Courses
            .Include(c => c.CourseCategory)
            .Include(c => c.CourseProvider)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null)
            return NotFound(new { Success = false, Message = "Course not found" });

        var assignments = await (
            from a in _context.CourseAssignments
            join emp in _context.Employees on a.EmployeeId equals emp.Id
            where a.CourseId == id
            select new
            {
                AssignmentId       = a.Id,
                EmployeeId         = emp.Id,
                EmployeeName       = emp.FirstName + " " + emp.LastName,
                emp.EmployeeCode,
                a.Status,
                a.ProgressPercentage,
                a.DueDate,
                StartedAt          = a.StartDate,
                CompletedAt        = a.CompletionDate,
                a.LastAccessedAt
            }
        ).ToListAsync();

        return Ok(new
        {
            Success = true,
            Data = new
            {
                course.Id,
                course.Title,
                course.CourseUrl,
                course.Description,
                Category    = new { Id = course.CourseCategoryId, Name = course.CourseCategory?.Name ?? "N/A" },
                Provider    = new { Id = course.CourseProviderId, Name = course.CourseProvider?.Name  ?? "N/A" },
                course.DurationHours,
                course.IsActive,
                course.CreatedAt,
                Stats = new
                {
                    Assigned   = assignments.Count,
                    Completed  = assignments.Count(a => a.Status == "Completed"),
                    InProgress = assignments.Count(a => a.Status == "InProgress"),
                    Pending    = assignments.Count(a => a.Status == "Pending" || a.Status == "Assigned")
                },
                Assignments = assignments
            }
        });
    }

    // POST: api/admin/courses
    [HttpPost]
    public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { Success = false, Message = "Title is required" });

        if (!await _context.CourseCategories.AnyAsync(c => c.Id == dto.CategoryId))
            return BadRequest(new { Success = false, Message = "Invalid CategoryId — category not found" });

        if (!await _context.CourseProviders.AnyAsync(p => p.Id == dto.ProviderId))
            return BadRequest(new { Success = false, Message = "Invalid ProviderId — provider not found" });

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var course = new Course
        {
            Id               = Guid.NewGuid(),
            Title            = dto.Title,
            Description      = dto.Description,
            CourseUrl        = dto.CourseUrl,
            CourseCategoryId = dto.CategoryId,
            CourseProviderId = dto.ProviderId,
            DurationHours    = dto.DurationHours,
            IsActive         = dto.IsActive,
            CreatedAt        = DateTime.UtcNow,
            CreatedBy        = userId != null ? Guid.Parse(userId) : Guid.Empty
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCourseById), new { id = course.Id }, new
        {
            Success   = true,
            Id        = course.Id,
            Title     = course.Title,
            CourseUrl = course.CourseUrl,
            CreatedAt = course.CreatedAt
        });
    }

    // PATCH: api/admin/courses/{id}
    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateCourse(Guid id, [FromBody] UpdateCourseDto dto)
    {
        if (dto == null)
            return BadRequest(new { Success = false, Message = "Request body is required" });

        var course = await _context.Courses.FindAsync(id);
        if (course == null)
            return NotFound(new { Success = false, Message = "Course not found" });

        if (!string.IsNullOrWhiteSpace(dto.Title))
            course.Title = dto.Title;

        if (dto.Description != null)
            course.Description = dto.Description;

        if (dto.CourseUrl != null)
            course.CourseUrl = dto.CourseUrl;

        if (dto.CategoryId.HasValue)
        {
            if (!await _context.CourseCategories.AnyAsync(c => c.Id == dto.CategoryId.Value))
                return BadRequest(new { Success = false, Message = "Invalid CategoryId — category not found" });
            course.CourseCategoryId = dto.CategoryId.Value;
        }

        if (dto.ProviderId.HasValue)
        {
            if (!await _context.CourseProviders.AnyAsync(p => p.Id == dto.ProviderId.Value))
                return BadRequest(new { Success = false, Message = "Invalid ProviderId — provider not found" });
            course.CourseProviderId = dto.ProviderId.Value;
        }

        if (dto.DurationHours.HasValue)
            course.DurationHours = dto.DurationHours.Value;

        if (dto.IsActive.HasValue)
            course.IsActive = dto.IsActive.Value;

        var updatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            Success       = true,
            Id            = course.Id,
            Title         = course.Title,
            CourseUrl     = course.CourseUrl,
            DurationHours = course.DurationHours,
            IsActive      = course.IsActive,
            UpdatedAt     = updatedAt
        });
    }

    // DELETE: api/admin/courses/{id}
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