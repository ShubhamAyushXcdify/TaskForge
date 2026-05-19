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
                Data    = new CourseDataDto()
            });
        }

        var query = from assignment in _context.CourseAssignments
                    join course in _context.Courses on assignment.CourseId equals course.Id
                    join category in _context.CourseCategories on course.CourseCategoryId equals category.Id
                    join provider in _context.CourseProviders on course.CourseProviderId equals provider.Id
                    join assignedByUser in _context.Users
                        on assignment.AssignedBy equals assignedByUser.Id
                        into assignedByGroup
                    from assignedByUser in assignedByGroup.DefaultIfEmpty()
                    join assignedByRole in _context.Roles
                        on assignedByUser.RoleId equals assignedByRole.Id
                        into roleGroup
                    from assignedByRole in roleGroup.DefaultIfEmpty()
                    where assignment.EmployeeId == employee.Id
                    select new CourseAssignmentDetailsDto
                    {
                        AssignmentId       = assignment.Id,
                        CourseId           = course.Id,
                        CourseTitle        = course.Title,
                        CourseUrl          = course.CourseUrl,
                        CourseCategory     = category.Name,
                        ProviderName       = provider.Name,
                        DurationHours      = (double)course.DurationHours,
                        AssignedDate       = assignment.CreatedAt,
                        Status             = assignment.Status,
                        ProgressPercentage = (double)assignment.ProgressPercentage,
                        StartedAt          = assignment.StartDate,
                        CompletedAt        = assignment.CompletionDate,
                        AssignedById       = assignedByUser != null ? assignedByUser.Id : (Guid?)null,
                        AssignedByName     = assignedByUser != null ? $"{assignedByUser.FirstName} {assignedByUser.LastName}".Trim() : null,
                        AssignedByEmail    = assignedByUser != null ? assignedByUser.Email : null,
                        AssignedByRole     = assignedByRole != null ? assignedByRole.Name : null
                    };

        var assignmentList = await query.ToListAsync();

        var response = new MyCoursesResponseDto
        {
            Success = true,
            Message = assignmentList.Any()
                ? "My courses retrieved successfully"
                : "No courses assigned to you yet",
            Data = new CourseDataDto
            {
                Summary = new CourseSummaryDto
                {
                    TotalAssigned   = assignmentList.Count,
                    TotalCompleted  = assignmentList.Count(x => x.Status == "Completed"),
                    TotalInProgress = assignmentList.Count(x => x.Status == "InProgress"),
                    TotalPending    = assignmentList.Count(x => x.Status == "Assigned" || x.Status == "Pending"),
                    TotalOverdue    = 0
                },
                Assignments = assignmentList
            }
        };

        return Ok(response);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var query = from course in _context.Courses
                    join category in _context.CourseCategories on course.CourseCategoryId equals category.Id
                    join provider in _context.CourseProviders on course.CourseProviderId equals provider.Id
                    select new CourseListItemDto
                    {
                        Id            = course.Id,
                        Title         = course.Title,
                        CourseUrl     = course.CourseUrl,
                        Category      = category.Name,
                        ProviderName  = provider.Name,
                        DurationHours = (double)course.DurationHours,
                        Description   = course.Description ?? string.Empty,
                        IsActive      = course.IsActive
                    };

        var coursesList = await query.ToListAsync();

        return Ok(new AllCoursesResponseDto
        {
            Success = true,
            Data    = coursesList
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var courseDetail = await (
            from course in _context.Courses
            join category in _context.CourseCategories on course.CourseCategoryId equals category.Id
            join provider in _context.CourseProviders on course.CourseProviderId equals provider.Id
            where course.Id == id
            select new CourseDetailDto
            {
                Id               = course.Id,
                Title            = course.Title,
                CourseUrl        = course.CourseUrl,
                Description      = course.Description ?? string.Empty,
                DurationHours    = (double)course.DurationHours,
                IsActive         = course.IsActive,
                CreatedAt        = course.CreatedAt,
                CategoryName     = category.Name,
                ProviderName     = provider.Name,
                ProviderWebsite  = provider.Website,
                TotalAssignments = _context.CourseAssignments.Count(ca => ca.CourseId == course.Id)
            }
        ).FirstOrDefaultAsync();

        if (courseDetail == null)
            return NotFound(new CourseDetailResponseDto
            {
                Success = false,
                Message = $"Course with ID {id} not found."
            });

        // Get latest assignment for this course with assignedBy info
        var latestAssignment = await (
            from assignment in _context.CourseAssignments
            join assignedByUser in _context.Users
                on assignment.AssignedBy equals assignedByUser.Id
                into assignedByGroup
            from assignedByUser in assignedByGroup.DefaultIfEmpty()
            join assignedByRole in _context.Roles
                on assignedByUser.RoleId equals assignedByRole.Id
                into roleGroup
            from assignedByRole in roleGroup.DefaultIfEmpty()
            where assignment.CourseId == id
            orderby assignment.CreatedAt descending
            select new
            {
                AssignedDate = assignment.CreatedAt,
                AssignedBy   = assignedByUser != null ? new
                {
                    Id    = assignedByUser.Id,
                    Name  = $"{assignedByUser.FirstName} {assignedByUser.LastName}".Trim(),
                    Email = assignedByUser.Email,
                    Role  = assignedByRole != null ? assignedByRole.Name : "N/A"
                } : null
            }
        ).FirstOrDefaultAsync();

        return Ok(new
        {
            Success = true,
            Message = "Course retrieved successfully",
            Data = new
            {
                courseDetail.Id,
                courseDetail.Title,
                courseDetail.CourseUrl,
                courseDetail.Description,
                courseDetail.DurationHours,
                courseDetail.IsActive,
                courseDetail.CreatedAt,
                courseDetail.CategoryName,
                courseDetail.ProviderName,
                courseDetail.ProviderWebsite,
                courseDetail.TotalAssignments,
                AssignedDate = latestAssignment?.AssignedDate,
                AssignedBy   = latestAssignment?.AssignedBy
            }
        });
    }

    [Authorize(Roles = "Manager,Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Course course)
    {
        if (course == null)
            return BadRequest("Invalid course data");

        course.Id        = Guid.NewGuid();
        course.CreatedAt = DateTime.UtcNow;
        course.IsActive  = true;

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
            course.CreatedBy = Guid.Parse(userId);

        var providerExists = await _context.CourseProviders.AnyAsync(x => x.Id == course.CourseProviderId);
        if (!providerExists) return BadRequest("Invalid CourseProviderId");

        var categoryExists = await _context.CourseCategories.AnyAsync(x => x.Id == course.CourseCategoryId);
        if (!categoryExists) return BadRequest("Invalid CourseCategoryId");

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return Ok(course);
    }
}