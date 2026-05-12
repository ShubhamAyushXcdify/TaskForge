namespace LearnTrack.Core.DTOs; 

public class CreateEmployeeDto 
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
    public Guid? ManagerId { get; set; }
    
    // ✅ Added so password isn't "auto-stored" without a choice
    public string? Password { get; set; } 
}

public class StatusUpdateDto 
{
    public bool IsActive { get; set; }
    public string? EmploymentStatus { get; set; }
}