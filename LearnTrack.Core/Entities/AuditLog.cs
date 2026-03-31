using System.ComponentModel.DataAnnotations.Schema;

namespace LearnTrack.Core.Entities;

[Table("auditlogs")]
public class AuditLog
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("userid")]
    public Guid UserId { get; set; }

    [Column("actiontype")]
    public string ActionType { get; set; } = string.Empty;

    [Column("entityname")]
    public string EntityName { get; set; } = string.Empty;

    [Column("changesjson")]
    public string ChangesJson { get; set; } = string.Empty;

    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}