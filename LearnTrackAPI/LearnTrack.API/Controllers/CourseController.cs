using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using LearnTrack.Core.DTOs; 

namespace LearnTrack.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CourseController : ControllerBase
{
    private readonly AppDbContext _context;

    public CourseController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("MyCourses")]
    public async Task<IActionResult> GetMyCourses()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) 
            return Unauthorized(new { Success = false, Message = "User not authenticated" });

        var userId = Guid.Parse(userIdClaim);

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (employee == null)
        {
            return Ok(new MyCoursesResponseDto
            {
                Success = true,
                Message = "No employee profile found for this user",
                Data = new CourseDataDto()
            });
        }

        var query = from assignment in _context.CourseAssignments
                    join course in _context.Courses on assignment.CourseId equals course.Id
                    join category in _context.CourseCategories on course.CourseCategoryId equals category.Id
                    join provider in _context.CourseProviders on course.CourseProviderId equals provider.Id
                    where assignment.EmployeeId == employee.Id
                    select new CourseAssignmentDetailsDto
                    {
                        AssignmentId = assignment.Id,
                        CourseId = course.Id,
                        CourseTitle = course.Title,
                        CourseCategory = category.Name,
                        ProviderName = provider.Name,
                        DurationHours = (double)course.DurationHours,
                        AssignedDate = assignment.CreatedAt,
                        Status = assignment.Status,
                        ProgressPercentage = (double)assignment.ProgressPercentage,
                        StartedAt = assignment.StartDate,
                        CompletedAt = assignment.CompletionDate
                    };

        var assignmentList = await query.ToListAsync();

        var response = new MyCoursesResponseDto
        {
            Success = true,
            Message = assignmentList.Any() ? "My courses retrieved successfully" : "No courses assigned to you yet",
            Data = new CourseDataDto
            {
                Summary = new CourseSummaryDto
                {
                    TotalAssigned = assignmentList.Count,
                    TotalCompleted = assignmentList.Count(x => x.Status == "Completed"),
                    TotalInProgress = assignmentList.Count(x => x.Status == "InProgress"),
                    TotalPending = assignmentList.Count(x => x.Status == "Assigned" || x.Status == "Pending"),
                    TotalOverdue = 0
                },
                Assignments = assignmentList
            }
        };

        return Ok(response);
    }

    [Authorize(Roles = "Admin,Manager,Employee,User")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var query = from course in _context.Courses
                    join category in _context.CourseCategories on course.CourseCategoryId equals category.Id
                    join provider in _context.CourseProviders on course.CourseProviderId equals provider.Id
                    select new CourseListItemDto
                    {
                        Id = course.Id,
                        Title = course.Title,
                        Category = category.Name,
                        ProviderName = provider.Name,
                        DurationHours = (double)course.DurationHours,
                        Description = course.Description ?? string.Empty,
                        IsActive = course.IsActive
                    };

        var coursesList = await query.ToListAsync();

        return Ok(new AllCoursesResponseDto
        {
            Success = true,
            Data = coursesList
        });
    }

    [Authorize(Roles = "Admin,Manager,Employee,User")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var query = from course in _context.Courses
                    join category in _context.CourseCategories on course.CourseCategoryId equals category.Id
                    join provider in _context.CourseProviders on course.CourseProviderId equals provider.Id
                    where course.Id == id
                    select new CourseDetailDto
                    {
                        Id = course.Id,
                        Title = course.Title,
                        Description = course.Description ?? string.Empty,
                        DurationHours = (double)course.DurationHours,
                        IsActive = course.IsActive,
                        CreatedAt = course.CreatedAt,
                        CategoryName = category.Name,
                        ProviderName = provider.Name,
                        TotalAssignments = _context.CourseAssignments.Count(ca => ca.CourseId == course.Id)
                    };

        var courseDetail = await query.FirstOrDefaultAsync();

        if (courseDetail == null)
        {
            return NotFound(new CourseDetailResponseDto
            {
                Success = false,
                Message = $"Course with ID {id} not found."
            });
        }

        return Ok(new CourseDetailResponseDto
        {
            Success = true,
            Message = "Course retrieved successfully",
            Data = courseDetail
        });
    }

    [Authorize(Roles = "Manager,Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Course course)
    {
        if (course == null)
            return BadRequest("Invalid course data");

        course.Id = Guid.NewGuid();
        course.CreatedAt = DateTime.UtcNow;
        course.IsActive = true;

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
        {
            course.CreatedBy = Guid.Parse(userId);
        }

        var providerExists = await _context.CourseProviders.AnyAsync(x => x.Id == course.CourseProviderId);
        if (!providerExists) return BadRequest("Invalid CourseProviderId");

        var categoryExists = await _context.CourseCategories.AnyAsync(x => x.Id == course.CourseCategoryId);
        if (!categoryExists) return BadRequest("Invalid CourseCategoryId");

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return Ok(course);
    }
}