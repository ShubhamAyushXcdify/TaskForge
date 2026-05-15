using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearnTrack.Infrastructure.Data;
using LearnTrack.Core.Entities;
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

    // GET: api/admin/employees
    [HttpGet]
    public async Task<IActionResult> GetAllEmployees()
    {
        var now = DateTime.UtcNow;

        var employees = await _context.Employees
            .Include(e => e.User)
                .ThenInclude(u => u!.Role)
            .Where(e => e.User != null && e.User.Role != null
                     && e.User.Role.Name != "Admin"
                     && e.User.Role.Name != "admin")
            .Select(e => new
            {
                e.Id,
                e.UserId,
                e.EmployeeCode,
                e.FirstName,
                e.LastName,
                Email = e.User != null ? e.User.Email : "No Email",
                Role = e.User != null && e.User.Role != null
                    ? new { Id = e.User.Role.Id, Name = e.User.Role.Name }
                    : (object)new { Id = Guid.Empty, Name = "N/A" },
                e.ManagerId,
                ManagerName = _context.Employees
                    .Where(m => m.Id == e.ManagerId)
                    .Select(m => m.FirstName + " " + m.LastName)
                    .FirstOrDefault() ?? "N/A",
                e.EmploymentStatus,
                e.IsActive,
                e.CreatedAt,
                AssignedCount   = _context.CourseAssignments.Count(a => a.EmployeeId == e.Id),
                CompletedCount  = _context.CourseAssignments.Count(a => a.EmployeeId == e.Id && a.Status == "Completed"),
                InProgressCount = _context.CourseAssignments.Count(a => a.EmployeeId == e.Id && a.Status == "InProgress"),
                PendingCount    = _context.CourseAssignments.Count(a => a.EmployeeId == e.Id && (a.Status == "Pending" || a.Status == "Assigned")),
                OverdueCount    = _context.CourseAssignments.Count(a => a.EmployeeId == e.Id && a.Status != "Completed" && a.DueDate != null && a.DueDate < now)
            })
            .ToListAsync();

        var result = employees.Select(e => new
        {
            e.Id,
            e.UserId,
            e.EmployeeCode,
            e.FirstName,
            e.LastName,
            e.Email,
            e.Role,
            e.ManagerId,
            e.ManagerName,
            e.EmploymentStatus,
            e.IsActive,
            e.CreatedAt,
            Stats = new
            {
                Assigned   = e.AssignedCount,
                Completed  = e.CompletedCount,
                InProgress = e.InProgressCount,
                Pending    = e.PendingCount,
                Overdue    = e.OverdueCount
            }
        }).ToList();

        return Ok(new { Success = true, Employees = result });
    }

    // GET: api/admin/employees/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetEmployeeById(Guid id)
    {
        var now = DateTime.UtcNow;

        var employee = await _context.Employees
            .Include(e => e.User)
                .ThenInclude(u => u!.Role)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return NotFound(new { Success = false, Message = "Employee not found" });

        var managerName = employee.ManagerId.HasValue
            ? await _context.Employees
                .Where(m => m.Id == employee.ManagerId)
                .Select(m => m.FirstName + " " + m.LastName)
                .FirstOrDefaultAsync() ?? "N/A"
            : "N/A";

        var assignments = await _context.CourseAssignments
            .Include(a => a.Course)
                .ThenInclude(c => c!.CourseCategory)
            .Where(a => a.EmployeeId == id)
            .Select(a => new
            {
                AssignmentId   = a.Id,
                CourseId       = a.CourseId,
                CourseTitle    = a.Course != null ? a.Course.Title : "N/A",
                Category       = a.Course != null && a.Course.CourseCategory != null ? a.Course.CourseCategory.Name : "N/A",
                DurationHours  = a.Course != null ? a.Course.DurationHours : 0,
                a.Status,
                a.ProgressPercentage,
                a.DueDate,
                StartedAt      = a.StartDate,
                CompletedAt    = a.CompletionDate,
                a.LastAccessedAt
            })
            .ToListAsync();

        int overdueCount = assignments.Count(a => a.Status != "Completed" && a.DueDate.HasValue && a.DueDate < now);

        return Ok(new
        {
            Success = true,
            Data = new
            {
                employee.Id,
                employee.UserId,
                employee.EmployeeCode,
                employee.FirstName,
                employee.LastName,
                Email = employee.User?.Email ?? "No Email",
                Role = employee.User?.Role != null
                    ? new { Id = employee.User.Role.Id, Name = employee.User.Role.Name }
                    : (object)new { Id = Guid.Empty, Name = "N/A" },
                employee.ManagerId,
                ManagerName      = managerName,
                employee.EmploymentStatus,
                employee.IsActive,
                employee.CreatedAt,
                Stats = new
                {
                    Assigned   = assignments.Count,
                    Completed  = assignments.Count(a => a.Status == "Completed"),
                    InProgress = assignments.Count(a => a.Status == "InProgress"),
                    Pending    = assignments.Count(a => a.Status == "Pending" || a.Status == "Assigned"),
                    Overdue    = overdueCount
                },
                Assignments = assignments
            }
        });
    }

    // POST: api/admin/employees
    [HttpPost]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { Success = false, Message = "Email is required" });

        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { Success = false, Message = "Email already exists" });

        if (await _context.Employees.AnyAsync(e => e.EmployeeCode == dto.EmployeeCode))
            return BadRequest(new { Success = false, Message = "Employee code already exists" });

        var invitationToken = Guid.NewGuid();
        var tokenExpiry     = DateTime.UtcNow.AddDays(7);

        string passwordToHash = string.IsNullOrEmpty(dto.Password) ? "Default@123" : dto.Password;

        var user = new User
        {
            Id           = Guid.NewGuid(),
            Email        = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordToHash),
            FirstName    = dto.FirstName,
            LastName     = dto.LastName,
            EmployeeCode = dto.EmployeeCode,
            RoleId       = dto.RoleId,
            IsActive     = true,
            CreatedAt    = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var employee = new Employee
        {
            Id               = Guid.NewGuid(),
            UserId           = user.Id,
            FirstName        = dto.FirstName,
            LastName         = dto.LastName,
            EmployeeCode     = dto.EmployeeCode,
            ManagerId        = dto.ManagerId,
            IsActive         = true,
            EmploymentStatus = "Active",
            CreatedAt        = DateTime.UtcNow
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEmployeeById), new { id = employee.Id }, new
        {
            Success         = true,
            Id              = employee.Id,
            EmployeeCode    = employee.EmployeeCode,
            Email           = user.Email,
            InvitationToken = invitationToken,
            TokenExpiry     = tokenExpiry,
            CreatedAt       = employee.CreatedAt
        });
    }

    // PATCH: api/admin/employees/{id}
    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateEmployee(Guid id, [FromBody] UpdateEmployeeDto dto)
    {
        if (dto == null)
            return BadRequest(new { Success = false, Message = "Request body is required" });

        var employee = await _context.Employees
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return NotFound(new { Success = false, Message = "Employee not found" });

        if (!string.IsNullOrWhiteSpace(dto.FirstName))
        {
            employee.FirstName = dto.FirstName;
            if (employee.User != null)
            {
                employee.User.FirstName = dto.FirstName;
                _context.Entry(employee.User).Property(u => u.FirstName).IsModified = true;
            }
        }

        if (!string.IsNullOrWhiteSpace(dto.LastName))
        {
            employee.LastName = dto.LastName;
            if (employee.User != null)
            {
                employee.User.LastName = dto.LastName;
                _context.Entry(employee.User).Property(u => u.LastName).IsModified = true;
            }
        }

        if (!string.IsNullOrWhiteSpace(dto.Email) && employee.User != null)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != employee.UserId))
                return BadRequest(new { Success = false, Message = "Email already in use" });
            employee.User.Email = dto.Email;
            _context.Entry(employee.User).Property(u => u.Email).IsModified = true;
        }

        if (dto.RoleId.HasValue && employee.User != null)
        {
            employee.User.RoleId = dto.RoleId.Value;
            _context.Entry(employee.User).Property(u => u.RoleId).IsModified = true;
        }

        if (!string.IsNullOrWhiteSpace(dto.Password) && employee.User != null)
        {
            employee.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            _context.Entry(employee.User).Property(u => u.PasswordHash).IsModified = true;
        }

        employee.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            Success   = true,
            Id        = employee.Id,
            FirstName = employee.FirstName,
            LastName  = employee.LastName,
            UpdatedAt = employee.UpdatedAt
        });
    }

    // PATCH: api/admin/employees/{id}/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] StatusUpdateDto dto)
    {
        var employee = await _context.Employees
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return NotFound(new { Success = false, Message = "Employee not found" });

        employee.IsActive         = dto.IsActive;
        employee.EmploymentStatus = !string.IsNullOrWhiteSpace(dto.EmploymentStatus)
            ? dto.EmploymentStatus
            : (dto.IsActive ? "Active" : "Inactive");

        if (employee.User != null)
        {
            employee.User.IsActive = dto.IsActive;
            _context.Entry(employee.User).Property(u => u.IsActive).IsModified = true;
        }

        employee.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            Success = true,
            Message = "Employee status updated successfully",
            Data = new
            {
                Id               = employee.Id,
                FirstName        = employee.FirstName,
                EmploymentStatus = employee.EmploymentStatus,
                IsActive         = employee.IsActive,
                UpdatedAt        = employee.UpdatedAt
            }
        });
    }
}