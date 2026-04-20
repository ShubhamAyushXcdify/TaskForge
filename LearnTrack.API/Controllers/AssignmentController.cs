using LearnTrack.Core.Entities;
using LearnTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace LearnTrack.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AssignmentController : ControllerBase
{
    private readonly AppDbContext _context;

    public AssignmentController(AppDbContext context)
    {
        _context = context;
    }

    // ✅ CREATE (KEEPING SWAYAM LOGIC SAFE)
    [Authorize(Roles = "Admin,Manager")]
    [HttpPost]
    public async Task<IActionResult> AssignCourse([FromBody] CourseAssignment assignment)
    {
        if (assignment == null)
            return BadRequest("Invalid data");

        // Validate Employee
        var employeeExists = await _context.Employees
            .AnyAsync(e => e.Id == assignment.EmployeeId);

        if (!employeeExists)
            return BadRequest("Invalid EmployeeId");

        assignment.Id = Guid.NewGuid();
        assignment.CreatedAt = DateTime.UtcNow;

        _context.CourseAssignments.Add(assignment);

        // 🔥 Audit Log (UNCHANGED LOGIC)
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var audit = new AuditLog
        {
            UserId = userIdClaim != null ? Guid.Parse(userIdClaim) : Guid.Empty,
            ActionType = "ASSIGN_COURSE",
            EntityName = "CourseAssignment",
            ChangesJson = JsonSerializer.Serialize(assignment)
        };

        _context.AuditLogs.Add(audit);

        await _context.SaveChangesAsync();

        return Ok(new { Message = "Course Assigned Successfully", Id = assignment.Id });
    }

    // ✅ GET ALL
    [Authorize(Roles = "Admin,Manager")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _context.CourseAssignments.ToListAsync();
        return Ok(data);
    }

    // ✅ GET BY ID
    [Authorize(Roles = "Admin,Manager")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var item = await _context.CourseAssignments.FindAsync(id);

        if (item == null)
            return NotFound("Assignment not found");

        return Ok(item);
    }

    // ✅ UPDATE
    [Authorize(Roles = "Employee")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, CourseAssignment updated)
    {
        var existing = await _context.CourseAssignments.FindAsync(id);

        if (existing == null)
            return NotFound("Assignment not found");

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.UserId.ToString() == userId);

        if (employee == null)
            return Unauthorized("Employee not found");

        // 🔐 Ownership check
        if (existing.EmployeeId != employee.Id)
            return Forbid("You can only update your own assignment");

        existing.ProgressPercentage = updated.ProgressPercentage;
        existing.Status = updated.Status;
        existing.StartDate = updated.StartDate;
        existing.CompletionDate = updated.CompletionDate;

        await _context.SaveChangesAsync();

        return Ok(existing);    
    }

    // ✅ DELETE
    [Authorize(Roles = "Admin,Manager")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _context.CourseAssignments.FindAsync(id);

        if (existing == null)
            return NotFound("Assignment not found");

        _context.CourseAssignments.Remove(existing);
        await _context.SaveChangesAsync();

        return Ok("Deleted successfully");
    }
}