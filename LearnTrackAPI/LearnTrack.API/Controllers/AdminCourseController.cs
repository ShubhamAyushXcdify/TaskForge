using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using LearnTrack.Core.DTOs;

namespace LearnTrack.API.Controllers;

[Authorize(Roles = "Admin")]   // Strictly Admin only
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
        var courses = await (from course in _context.Courses
                             join category in _context.CourseCategories on course.CourseCategoryId equals category.Id
                             join provider in _context.CourseProviders on course.CourseProviderId equals provider.Id
                             select new
                             {
                                 course.Id,
                                 course.Title,
                                 course.Description,
                                 Category = new { category.Id, category.Name },
                                 Provider = new { provider.Id, provider.Name },
                                 course.DurationHours,
                                 course.IsActive,
                                 course.CreatedBy,
                                 course.CreatedAt,
                                 Stats = new
                                 {
                                     Assigned = _context.CourseAssignments.Count(a => a.CourseId == course.Id),
                                     Completed = _context.CourseAssignments.Count(a => a.CourseId == course.Id && a.Status == "Completed"),
                                     InProgress = _context.CourseAssignments.Count(a => a.CourseId == course.Id && a.Status == "InProgress"),
                                     Pending = _context.CourseAssignments.Count(a => a.CourseId == course.Id && (a.Status == "Pending" || a.Status == "Assigned")),
                                     CompletionRate = _context.CourseAssignments.Count(a => a.CourseId == course.Id) > 0 
                                         ? Math.Round((double)_context.CourseAssignments.Count(a => a.CourseId == course.Id && a.Status == "Completed") 
                                             / _context.CourseAssignments.Count(a => a.CourseId == course.Id) * 100, 2) : 0
                                 }
                             }).ToListAsync();

        return Ok(new { Success = true, Courses = courses });
    }

    // GET: api/admin/courses/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourseById(Guid id)
    {
        var courseDetail = await (from course in _context.Courses
                                  join category in _context.CourseCategories on course.CourseCategoryId equals category.Id
                                  join provider in _context.CourseProviders on course.CourseProviderId equals provider.Id
                                  where course.Id == id
                                  select new
                                  {
                                      course.Id,
                                      course.Title,
                                      course.Description,
                                      Category = new { category.Id, category.Name },
                                      Provider = new { provider.Id, provider.Name },
                                      course.DurationHours,
                                      course.IsActive,
                                      course.CreatedAt,
                                      Stats = new
                                      {
                                          Assigned = _context.CourseAssignments.Count(a => a.CourseId == id),
                                          Completed = _context.CourseAssignments.Count(a => a.CourseId == id && a.Status == "Completed"),
                                          InProgress = _context.CourseAssignments.Count(a => a.CourseId == id && a.Status == "InProgress"),
                                          Pending = _context.CourseAssignments.Count(a => a.CourseId == id && (a.Status == "Pending" || a.Status == "Assigned"))
                                      },
                                      Assignments = (from a in _context.CourseAssignments
                                                     join emp in _context.Employees on a.EmployeeId equals emp.Id
                                                     where a.CourseId == id
                                                     select new
                                                     {
                                                         AssignmentId = a.Id,
                                                         EmployeeId = emp.Id,
                                                         EmployeeName = $"{emp.FirstName} {emp.LastName}",
                                                         emp.EmployeeCode,
                                                         a.Status,
                                                         a.ProgressPercentage,
                                                         a.StartDate,
                                                         a.CompletionDate
                                                     }).ToList()
                                  }).FirstOrDefaultAsync();

        if (courseDetail == null)
            return NotFound(new { Success = false, Message = "Course not found" });

        return Ok(new { Success = true, Data = courseDetail });
    }

    // POST: api/admin/courses
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

    // PATCH: api/admin/courses/{id}
    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateCourse(Guid id, [FromBody] Course updatedCourse)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null)
            return NotFound(new { Success = false, Message = "Course not found" });

        if (!string.IsNullOrEmpty(updatedCourse.Title))
            course.Title = updatedCourse.Title;

        if (!string.IsNullOrEmpty(updatedCourse.Description))
            course.Description = updatedCourse.Description;

        if (updatedCourse.DurationHours > 0)
            course.DurationHours = updatedCourse.DurationHours;

        if (updatedCourse.CourseCategoryId != default)
            course.CourseCategoryId = updatedCourse.CourseCategoryId;

        if (updatedCourse.CourseProviderId != default)
            course.CourseProviderId = updatedCourse.CourseProviderId;

        course.IsActive = updatedCourse.IsActive;

        await _context.SaveChangesAsync();

        return Ok(new { Success = true, Message = "Course updated successfully", Id = course.Id });
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