using System.ComponentModel.DataAnnotations.Schema;

namespace LearnTrack.Core.Entities;

[Table("users")]
public class User
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Column("passwordhash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("first_name")]
    public string FirstName { get; set; } = string.Empty;

    [Column("last_name")]
    public string LastName { get; set; } = string.Empty;

    [Column("employee_code")]
    public string EmployeeCode { get; set; } = string.Empty;

    [Column("roleid")]
    public Guid RoleId { get; set; }

    public Role? Role { get; set; }

    [Column("isactive")]
    public bool IsActive { get; set; } = true;

    [Column("is_email_verified")]
    public bool IsEmailVerified { get; set; } = false;

    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}