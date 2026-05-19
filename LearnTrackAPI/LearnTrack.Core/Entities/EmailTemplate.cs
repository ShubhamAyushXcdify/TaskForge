using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LearnTrack.Core.Entities;

[Table("emailtemplates")]
public class EmailTemplate
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("subject")]
    public string Subject { get; set; } = string.Empty;

    [Column("body")]
    public string Body { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Column("isactive")]
    public bool IsActive { get; set; } = true;

    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updatedat")]
    public DateTime? UpdatedAt { get; set; }
}