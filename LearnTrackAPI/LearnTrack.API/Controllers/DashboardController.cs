using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using LearnTrack.Core.DTOs;

namespace LearnTrack.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();
        var userId = Guid.Parse(userIdClaim);

        var assignments = await _context.CourseAssignments
            .Where(a => a.EmployeeId == userId)
            .ToListAsync();

        int totalAssigned = assignments.Count;
        int completed = assignments.Count(a => a.Status == "Completed");
        int inProgress = assignments.Count(a => a.Status == "In Progress");
        int notStarted = assignments.Count(a => a.Status == "Pending");

        // Calculate total hours from the Courses table for completed assignments
        var completedCourseIds = assignments.Where(a => a.Status == "Completed").Select(a => a.CourseId).ToList();
        var totalHours = await _context.Courses
            .Where(c => completedCourseIds.Contains(c.Id))
            .SumAsync(c => (double)c.DurationHours);

        var stats = new DashboardStatsDto
        {
            Assigned = totalAssigned,
            Completed = completed,
            InProgress = inProgress,
            NotStarted = notStarted,
            CompletionRate = totalAssigned > 0 ? Math.Round((double)completed / totalAssigned * 100, 2) : 0,
            TotalHoursSpent = totalHours,
            AvgScore = null 
        };

        return Ok(new DashboardStatsResponse { Success = true, Data = stats });
    }

    [HttpGet("weekly-hours")]
    public async Task<IActionResult> GetWeeklyHours()
    {
        // Weekly tracking usually requires a dedicated 'LearningLogs' table.
        // Returning an empty structure for now to keep your API working.
        var data = new WeeklyHoursDataDto
        {
            ThisWeek = new List<DayHourDto>(),
            LastWeek = new List<DayHourDto>()
        };
        
        return Ok(new WeeklyHoursResponse { Success = true, Data = data });
    }

    [HttpGet("category-breakdown")]
public async Task<IActionResult> GetCategoryBreakdown()
{
    var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null) return Unauthorized();
    var userId = Guid.Parse(userIdClaim);

    // Using CourseCategoryId instead of CategoryId to match your schema
    var query = from assignment in _context.CourseAssignments
                join course in _context.Courses on assignment.CourseId equals course.Id
                join category in _context.CourseCategories on course.CourseCategoryId equals category.Id
                where assignment.EmployeeId == userId
                group category by category.Name into g
                select new
                {
                    Category = g.Key,
                    Count = g.Count()
                };

    var results = await query.ToListAsync();
    int total = results.Sum(r => r.Count);

    var breakdown = results.Select(r => new CategoryBreakdownDto
    {
        Category = r.Category,
        Count = r.Count,
        Percentage = total > 0 ? Math.Round((double)r.Count / total * 100, 2) : 0
    }).ToList();

    return Ok(new CategoryBreakdownResponse { Success = true, Data = breakdown });
}

    [HttpGet("activity")]
    public async Task<IActionResult> GetActivity()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();
        var userId = Guid.Parse(userIdClaim);

        // Fetching the 5 most recent activities based on assignment creation
        var activities = await (from assignment in _context.CourseAssignments
                                join course in _context.Courses on assignment.CourseId equals course.Id
                                where assignment.EmployeeId == userId
                                orderby assignment.CreatedAt descending
                                select new ActivityDto
                                {
                                    Id = assignment.Id,
                                    Type = assignment.Status == "Completed" ? "completed" : "started",
                                    Title = $"{(assignment.Status == "Completed" ? "Completed" : "Started")} {course.Title}",
                                    Timestamp = assignment.CreatedAt
                                }).Take(5).ToListAsync();

        return Ok(new ActivityResponse { Success = true, Data = activities });
    }
}