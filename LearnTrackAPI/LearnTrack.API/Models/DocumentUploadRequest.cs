using Microsoft.AspNetCore.Http;

public class DocumentUploadRequest
{
    public IFormFile File { get; set; } = null!;
    public Guid EmployeeId { get; set; }
    public Guid AssignmentId { get; set; }
}