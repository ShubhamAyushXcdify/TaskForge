using System.ComponentModel.DataAnnotations.Schema;

namespace LearnTrack.Core.Entities;

[Table("employees")]
public class Employee
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("userid")]
    public Guid UserId { get; set; }

    [Column("firstname")]
    public string FirstName { get; set; } = string.Empty;

    [Column("lastname")]
    public string LastName { get; set; } = string.Empty;

    [Column("department")]
    public string Department { get; set; } = string.Empty;

    [Column("employeecode")]
    public string EmployeeCode { get; set; } = string.Empty;

    // 🔥 NEW (from ER diagram)
    [Column("managerid")]
    public Guid? ManagerId { get; set; }

    // 🔥 NEW (from ER diagram)
    [Column("employmentstatus")]
    public string EmploymentStatus { get; set; } = "Active";

    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updatedat")]
    public DateTime? UpdatedAt { get; set; }
}