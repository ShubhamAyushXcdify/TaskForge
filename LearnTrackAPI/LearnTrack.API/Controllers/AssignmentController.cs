using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
using Microsoft.EntityFrameworkCore;
using LearnTrack.Core.DTOs;

namespace LearnTrack.API.Controllers;

[Authorize]        // ← Changed to allow any logged-in user
[ApiController]
[Route("api/[controller]")]
public class AssignmentController : ControllerBase
{
    private readonly AppDbContext _context;

    public AssignmentController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAssignmentDto dto)
    {
        if (dto == null)
            return BadRequest(new { Success = false, Message = "Invalid data" });

        var courseExists = await _context.Courses.AnyAsync(c => c.Id == dto.CourseId);
        if (!courseExists) 
            return BadRequest(new { Success = false, Message = "Invalid Course ID" });

        var employeeExists = await _context.Employees.AnyAsync(e => e.Id == dto.EmployeeId);
        if (!employeeExists) 
            return BadRequest(new { Success = false, Message = "Invalid Employee ID" });

        var alreadyAssigned = await _context.CourseAssignments
            .AnyAsync(a => a.CourseId == dto.CourseId && a.EmployeeId == dto.EmployeeId);

        if (alreadyAssigned) 
            return BadRequest(new { Success = false, Message = "Course already assigned to this employee" });

        var assignment = new CourseAssignment
        {
            Id = Guid.NewGuid(),
            CourseId = dto.CourseId,
            EmployeeId = dto.EmployeeId,
            Status = "Pending",
            ProgressPercentage = 0,
            CreatedAt = DateTime.UtcNow
        };

        _context.CourseAssignments.Add(assignment);
        await _context.SaveChangesAsync();

        return Ok(new AssignmentResponseDto 
        { 
            Success = true, 
            Message = "Course assigned successfully",
            Data = assignment
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var query = from assignment in _context.CourseAssignments
                    join course in _context.Courses on assignment.CourseId equals course.Id
                    join user in _context.Users on assignment.EmployeeId equals user.Id
                    select new
                    {
                        assignment.Id,
                        CourseTitle = course.Title,
                        EmployeeName = $"{user.FirstName} {user.LastName}",
                        assignment.Status,
                        assignment.ProgressPercentage,
                        assignment.CreatedAt
                    };

        var results = await query.ToListAsync();

        return Ok(new { Success = true, Data = results });
    }
}