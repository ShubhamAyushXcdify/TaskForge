namespace LearnTrack.Core.DTOs;

public class EmployeeResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;

    public Guid? ManagerId { get; set; }

    public string EmploymentStatus { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}