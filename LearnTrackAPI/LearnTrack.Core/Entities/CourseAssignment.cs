using System.ComponentModel.DataAnnotations.Schema;

namespace LearnTrack.Core.Entities;

[Table("courseassignments")]
public class CourseAssignment
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("employeeid")]
    public Guid EmployeeId { get; set; }

    [Column("courseid")]
    public Guid CourseId { get; set; }

    [Column("progresspercentage")]
    public decimal ProgressPercentage { get; set; }

    [Column("status")]
    public string Status { get; set; } = "Assigned";

    [Column("startdate")]
    public DateTime? StartDate { get; set; }

    [Column("completiondate")]
    public DateTime? CompletionDate { get; set; }

    // ✅ These must exist for the Controller to compile
    [Column("duedate")]
    public DateTime? DueDate { get; set; }

    [Column("lastaccessedat")]
    public DateTime? LastAccessedAt { get; set; }

    [Column("updatedat")]
    public DateTime? UpdatedAt { get; set; }

    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public virtual Course? Course { get; set; }
    public virtual Employee? Employee { get; set; }
}