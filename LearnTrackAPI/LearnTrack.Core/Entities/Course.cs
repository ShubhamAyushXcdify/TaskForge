using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace LearnTrack.Core.Entities;

[Table("courses")]
public class Course
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Column("durationhours")]
    public decimal DurationHours { get; set; }

    [Column("coursecategoryid")]
    public Guid CourseCategoryId { get; set; }

    [Column("courseproviderid")]
    public Guid CourseProviderId { get; set; }

    [Column("isactive")]
    public bool IsActive { get; set; }

    [Column("createdby")]
    public Guid CreatedBy { get; set; }

    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ✅ Navigation Properties - Named to match your Controller's ".ThenInclude" calls
    [ForeignKey("CourseCategoryId")]
    public virtual CourseCategory? CourseCategory { get; set; }

    [ForeignKey("CourseProviderId")]
    public virtual CourseProvider? CourseProvider { get; set; }
    
    public virtual ICollection<CourseAssignment> Assignments { get; set; } = new List<CourseAssignment>();
}