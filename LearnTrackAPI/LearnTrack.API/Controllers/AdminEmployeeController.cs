using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
using Microsoft.EntityFrameworkCore;
using LearnTrack.Core.DTOs;

namespace LearnTrack.API.Controllers;

[Authorize(Roles = "Admin,admin")]
[ApiController]
[Route("api/admin/employees")]
public class AdminEmployeeController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminEmployeeController(AppDbContext context)
    {
        _context = context;
    }

    // 1. GET: api/admin/employees (Filters out Admins)
    [HttpGet]
    public async Task<IActionResult> GetAllEmployees()
    {
        var employees = await _context.Employees
            .Include(e => e.User)
            .ThenInclude(u => u.Role)
            // ✅ Only show users who are NOT Admins
            .Where(e => e.User != null && e.User.Role != null && 
                        e.User.Role.Name != "Admin" && e.User.Role.Name != "admin")
            .Select(e => new
            {
                e.Id,
                e.UserId,
                e.EmployeeCode,
                e.FirstName,
                e.LastName,
                Email = e.User != null ? e.User.Email : "No Email",
                e.ManagerId,
                ManagerName = _context.Employees
                    .Where(m => m.Id == e.ManagerId)
                    .Select(m => m.FirstName + " " + m.LastName)
                    .FirstOrDefault() ?? "N/A",
                EmploymentStatus = e.EmploymentStatus,
                e.IsActive,
                e.CreatedAt,
                Stats = new
                {
                    Assigned = _context.CourseAssignments.Count(a => a.EmployeeId == e.Id),
                    Completed = _context.CourseAssignments.Count(a => a.EmployeeId == e.Id && a.Status == "Completed"),
                    InProgress = _context.CourseAssignments.Count(a => a.EmployeeId == e.Id && a.Status == "InProgress"),
                    Pending = _context.CourseAssignments.Count(a => a.EmployeeId == e.Id && (a.Status == "Pending" || a.Status == "Assigned"))
                }
            })
            .ToListAsync();

        return Ok(new { Success = true, Employees = employees });
    }

    // 2. GET: api/admin/employees/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetEmployeeById(Guid id)
    {
        var employee = await _context.Employees
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return NotFound(new { Success = false, Message = "Employee not found" });

        var assignments = await (from a in _context.CourseAssignments
                                 join c in _context.Courses on a.CourseId equals c.Id
                                 join cat in _context.CourseCategories on c.CourseCategoryId equals cat.Id
                                 where a.EmployeeId == id
                                 select new
                                 {
                                     AssignmentId = a.Id,
                                     CourseTitle = c.Title,
                                     Category = cat.Name,
                                     DurationHours = c.DurationHours,
                                     a.Status,
                                     a.ProgressPercentage,
                                     StartedAt = a.StartDate,
                                     CompletedAt = a.CompletionDate
                                 }).ToListAsync();

        var managerName = await _context.Employees
            .Where(m => m.Id == employee.ManagerId)
            .Select(m => m.FirstName + " " + m.LastName)
            .FirstOrDefaultAsync() ?? "N/A";

        var response = new
        {
            employee.Id,
            employee.UserId,
            employee.EmployeeCode,
            employee.FirstName,
            employee.LastName,
            Email = employee.User?.Email ?? "No Email",
            employee.ManagerId,
            ManagerName = managerName,
            employee.EmploymentStatus,
            employee.IsActive,
            employee.CreatedAt,
            Stats = new
            {
                Assigned = assignments.Count,
                Completed = assignments.Count(a => a.Status == "Completed"),
                InProgress = assignments.Count(a => a.Status == "InProgress"),
                Pending = assignments.Count(a => a.Status == "Pending")
            },
            Assignments = assignments
        };

        return Ok(new { Success = true, Data = response });
    }

    // 3. POST: api/admin/employees
    [HttpPost]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeDto dto)
    {
        if (dto == null || string.IsNullOrEmpty(dto.Email))
            return BadRequest(new { Success = false, Message = "Email is required" });

        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { Success = false, Message = "User with this email already exists" });

        // ✅ If no password is provided, use a default fallback
        string passwordToHash = string.IsNullOrEmpty(dto.Password) ? "Default@123" : dto.Password;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordToHash), 
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            RoleId = dto.RoleId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            EmployeeCode = dto.EmployeeCode,
            ManagerId = dto.ManagerId,
            IsActive = true,
            EmploymentStatus = "Active",
            CreatedAt = DateTime.UtcNow
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEmployeeById), new { id = employee.Id }, 
            new { Success = true, Message = "Employee created successfully", EmployeeId = employee.Id });
    }

    // 4. PATCH: api/admin/employees/{id}
    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateEmployee(Guid id, [FromBody] Employee updatedData)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return NotFound();

        if (!string.IsNullOrEmpty(updatedData.FirstName)) employee.FirstName = updatedData.FirstName;
        if (!string.IsNullOrEmpty(updatedData.LastName)) employee.LastName = updatedData.LastName;
        if (updatedData.ManagerId.HasValue) employee.ManagerId = updatedData.ManagerId;
        
        employee.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { Success = true, Message = "Employee updated successfully" });
    }

    // 5. PATCH: api/admin/employees/{id}/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] StatusUpdateDto dto)
    {
        var employee = await _context.Employees.Include(e => e.User).FirstOrDefaultAsync(e => e.Id == id);
        if (employee == null) return NotFound();

        employee.IsActive = dto.IsActive;
        employee.EmploymentStatus = !string.IsNullOrEmpty(dto.EmploymentStatus) ? dto.EmploymentStatus : (dto.IsActive ? "Active" : "Inactive");
        
        if (employee.User != null)
        {
            employee.User.IsActive = dto.IsActive;
        }

        employee.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { Success = true, Message = "Employee status updated successfully" });
    }
}