using LearnTrack.Core.Entities;
using LearnTrack.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        return Ok(employees);
    }

    // ✅ GET EMPLOYEE BY ID
    [Authorize(Roles = "Admin,Manager")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetEmployeeById(Guid id)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
            return NotFound("Employee not found");

        return Ok(employee);
    }

    // ✅ CREATE EMPLOYEE (ER SAFE)
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

        return Ok(employee);
    }

    // ✅ UPDATE EMPLOYEE (ER SAFE)
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

        return Ok(employee);
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