namespace LearnTrack.Core.DTOs;

public class CreateEmployeeDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
    public Guid? ManagerId { get; set; }
    public string? Password { get; set; }
}

public class UpdateEmployeeDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Password { get; set; }
    public Guid? EmployeeId { get; set; }
    public Guid? RoleId { get; set; }
}

public class StatusUpdateDto
{
    public bool IsActive { get; set; }
    public string? EmploymentStatus { get; set; }
    public string? Reason { get; set; }
}

public class EmployeeResponseDto
{
    public bool Success { get; set; }
    public List<EmployeeListItemDto> Data { get; set; } = new();
}

public class EmployeeListItemDto
{
    public Guid Id { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class EmployeeDetailResponseDto
{
    public bool Success { get; set; }
    public EmployeeListItemDto Data { get; set; } = new();
}

public class RoleResponseDto
{
    public bool Success { get; set; }
    public List<RoleItemDto> Data { get; set; } = new();
}

public class RoleItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class AssignmentResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public object? Data { get; set; }
}

public class PatchEmployeeDto
{
    public string? FirstName { get; set; }
    public string? LastName  { get; set; }
    public string? Password  { get; set; }
}