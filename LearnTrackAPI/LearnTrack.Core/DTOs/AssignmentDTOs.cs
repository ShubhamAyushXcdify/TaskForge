namespace LearnTrack.Core.DTOs;

public class CreateAssignmentDto
{
    public Guid CourseId { get; set; }
    public List<Guid> EmployeeIds { get; set; } = new();
    public DateTime? DueDate { get; set; }
}

public class UpdateAssignmentDto
{
    public int? ProgressPercentage { get; set; }
    public string? Status { get; set; }
    public DateTime? LastAccessedAt { get; set; }
}

public class UpdateAssignmentStatusDto
{
    public string Status { get; set; } = string.Empty;
    public string? Reason { get; set; }
}