using Microsoft.EntityFrameworkCore;
using LearnTrack.Core.Entities;

namespace LearnTrack.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Employee> Employees { get; set; }
    public DbSet<CourseAssignment> CourseAssignments { get; set; }
    public DbSet<CourseProvider> CourseProviders { get; set; }
    public DbSet<CourseCategory> CourseCategories { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<Document> Documents { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<Todo> Todos { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ❌ REMOVED: The global lowercase loop - it fights with [Column] attributes
        // ❌ REMOVED: All explicit HasColumnName("id") calls - they cause double registration

        // ✅ User setup only
        modelBuilder.Entity<User>()
            .Property(u => u.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany()
            .HasForeignKey(u => u.RoleId);
    }
}