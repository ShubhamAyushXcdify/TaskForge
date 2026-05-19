using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LearnTrack.Core.Entities;

[Table("employees")]
public class Employee
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("userid")]
    public Guid UserId { get; set; }

    // ✅ Navigation Property: Allows fetching Email and Role from the User table
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    [Column("firstname")]
    public string FirstName { get; set; } = string.Empty;

    [Column("lastname")]
    public string LastName { get; set; } = string.Empty;

    [Column("department")]
    public string Department { get; set; } = string.Empty;

    [Column("employeecode")]
    public string EmployeeCode { get; set; } = string.Empty;

    [Column("managerid")]
    public Guid? ManagerId { get; set; }

    [Column("employmentstatus")]
    public string EmploymentStatus { get; set; } = "Active";

    // ✅ IsActive Property: Required for the status update logic in your controller
    [Column("isactive")]
    public bool IsActive { get; set; } = true;

    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updatedat")]
    public DateTime? UpdatedAt { get; set; }
}