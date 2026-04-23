using LearnTrack.Core.Entities;
using LearnTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearnTrack.Core.DTOs;

namespace LearnTrack.API.Controllers;
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EmployeeController : ControllerBase
{
    private readonly AppDbContext _context;

    public EmployeeController(AppDbContext context)
    {
        _context = context;
    }

    // ✅ GET ALL EMPLOYEES

    [Authorize(Roles = "Admin,Manager")]
    [HttpGet]
    public async Task<IActionResult> GetAllEmployees()
    {
        var employees = await _context.Employees.ToListAsync();

        var response = employees.Select(e => new EmployeeResponseDto
        {
            Id = e.Id,
            UserId = e.UserId,
            FirstName = e.FirstName,
            LastName = e.LastName,
            Department = e.Department,
            EmployeeCode = e.EmployeeCode,
            ManagerId = e.ManagerId,
            EmploymentStatus = e.EmploymentStatus,
            CreatedAt = e.CreatedAt
        });

        return Ok(response);
    }

    // ✅ GET EMPLOYEE BY ID
    [Authorize(Roles = "Admin,Manager")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetEmployeeById(Guid id)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
            return NotFound("Employee not found");

        var response = new EmployeeResponseDto
        {
            Id = employee.Id,
            UserId = employee.UserId,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            Department = employee.Department,
            EmployeeCode = employee.EmployeeCode,
            ManagerId = employee.ManagerId,
            EmploymentStatus = employee.EmploymentStatus,
            CreatedAt = employee.CreatedAt
        };

        return Ok(response);
    }

    // ✅ CREATE EMPLOYEE 
    [Authorize(Roles = "Admin,Manager")]
    [HttpPost]
    public async Task<IActionResult> CreateEmployee(Employee employee)
    {
        if (employee == null)
            return BadRequest("Invalid data");

        // 🔥 CHECK: User must exist (ER relationship)
        var userExists = await _context.Users.AnyAsync(u => u.Id == employee.UserId);
        if (!userExists)
            return BadRequest("Invalid UserId");

        employee.Id = Guid.NewGuid();

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return Ok(new EmployeeResponseDto
        {
            Id = employee.Id,
            UserId = employee.UserId,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            Department = employee.Department,
            EmployeeCode = employee.EmployeeCode,
            ManagerId = employee.ManagerId,
            EmploymentStatus = employee.EmploymentStatus,
            CreatedAt = employee.CreatedAt
        });
    }

    // ✅ UPDATE EMPLOYEE 
    [Authorize(Roles = "Admin,Manager")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(Guid id, Employee updatedEmployee)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
            return NotFound("Employee not found");

        // 🔥 CHECK: User must exist
        var userExists = await _context.Users.AnyAsync(u => u.Id == updatedEmployee.UserId);
        if (!userExists)
            return BadRequest("Invalid UserId");

        employee.FirstName = updatedEmployee.FirstName;
        employee.LastName = updatedEmployee.LastName;
        employee.Department = updatedEmployee.Department;
        employee.EmployeeCode = updatedEmployee.EmployeeCode;
        employee.UserId = updatedEmployee.UserId;

        await _context.SaveChangesAsync();

        return Ok(new EmployeeResponseDto
        {
            Id = employee.Id,
            UserId = employee.UserId,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            Department = employee.Department,
            EmployeeCode = employee.EmployeeCode,
            ManagerId = employee.ManagerId,
            EmploymentStatus = employee.EmploymentStatus,
            CreatedAt = employee.CreatedAt
        });
    }

    // ✅ DELETE EMPLOYEE
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(Guid id)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
            return NotFound("Employee not found");

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();

        return Ok("Employee deleted successfully");
    }
}