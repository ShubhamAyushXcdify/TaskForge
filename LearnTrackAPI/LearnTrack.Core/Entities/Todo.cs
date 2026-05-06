using System;

namespace LearnTrack.Core.Entities;

public class Todo
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;     // Task Name
    public DateTime? DueDate { get; set; }                // Due Date
    public bool IsCompleted { get; set; } = false;
    public DateTime CreatedAt { get; set; }
}