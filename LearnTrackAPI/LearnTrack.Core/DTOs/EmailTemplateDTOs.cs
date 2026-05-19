namespace LearnTrack.Core.DTOs;

public class CreateEmailTemplateDto
{
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateEmailTemplateDto
{
    public string? Name { get; set; }
    public string? Subject { get; set; }
    public string? Body { get; set; }
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
}