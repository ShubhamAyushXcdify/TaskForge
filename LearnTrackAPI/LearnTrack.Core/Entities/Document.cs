public class Document
{
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }
    public Guid CourseAssignmentId { get; set; }

    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;

    public byte[] Content { get; set; } = Array.Empty<byte>();

    public Guid UploadedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}