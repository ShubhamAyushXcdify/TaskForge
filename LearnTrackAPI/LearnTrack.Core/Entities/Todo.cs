using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LearnTrack.Core.Entities;

[Table("todos")]
public class Todo
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("userid")]
    public Guid UserId { get; set; }

    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Column("duedate")]
    public DateTime? DueDate { get; set; }

    [Column("iscompleted")]
    public bool IsCompleted { get; set; } = false;

    [Column("createdat")]
    public DateTime CreatedAt { get; set; }

    [Column("completedat")]
    public DateTime? CompletedAt { get; set; }
}