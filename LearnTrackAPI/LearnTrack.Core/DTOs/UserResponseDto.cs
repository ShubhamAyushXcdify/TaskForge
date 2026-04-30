namespace LearnTrack.Core.DTOs;

public class UserResponseDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}