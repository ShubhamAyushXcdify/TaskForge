using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearnTrack.Infrastructure.Data;

namespace LearnTrack.API.Controllers;

[Authorize(Roles = "Admin,admin")]
[ApiController]
[Route("api/admin/dashboard")]
public class AdminDashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminDashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        // ✅ Fix: Use standard UtcNow but ensure comparisons are handled cleanly 
        // across server environments and PostgreSQL timestamptz offsets.
        var now = DateTime.UtcNow;

        // ── Core counts ──────────────────────────────────────────────
        var totalEmployees  = await _context.Employees.CountAsync();
        var activeEmployees = await _context.Employees.CountAsync(e => e.IsActive);
        var activeCourses   = await _context.Courses.CountAsync(c => c.IsActive);

        var allAssignments  = await _context.CourseAssignments.ToListAsync();
        var totalAssignments = allAssignments.Count;
        var completedCount   = allAssignments.Count(a => a.Status == "Completed");
        var inProgressCount  = allAssignments.Count(a => a.Status == "InProgress");
        var assignedCount    = allAssignments.Count(a => a.Status == "Assigned" || a.Status == "Pending");
        
        // ✅ Fix: Force a unified Kind comparison or evaluation in memory to avoid offset calculation drops
        var overdueCount     = allAssignments.Count(a =>
            a.DueDate.HasValue &&
            (a.DueDate.Value.Kind == DateTimeKind.Utc ? a.DueDate.Value : a.DueDate.Value.ToUniversalTime()) < now &&
            a.Status != "Completed");
            
        var certsIssued      = allAssignments.Count(a => a.CertificateUrl != null);
        var completionRate   = totalAssignments > 0
            ? Math.Round((double)completedCount / totalAssignments * 100, 2)
            : 0;

        // ── Status breakdown ─────────────────────────────────────────
        var statusBreakdown = new
        {
            Assigned   = assignedCount,
            InProgress = inProgressCount,
            Completed  = completedCount,
            Overdue    = overdueCount
        };

        // ── Category breakdown ─────────────────────────────────────────
        var rawCategoryData = await (
            from course in _context.Courses
            join category in _context.CourseCategories on course.CourseCategoryId equals category.Id
            join assignment in _context.CourseAssignments
                on course.Id equals assignment.CourseId into assignmentGroup
            from assignment in assignmentGroup.DefaultIfEmpty()
            select new
            {
                CategoryId   = category.Id,
                CategoryName = category.Name,
                CourseId     = course.Id,
                Status       = assignment != null ? assignment.Status : null
            }
        ).ToListAsync();

        var categoryBreakdown = rawCategoryData
            .GroupBy(x => new { x.CategoryId, x.CategoryName })
            .Select(g =>
            {
                var assigned  = g.Count(x => x.Status != null);
                var completed = g.Count(x => x.Status == "Completed");
                return new
                {
                    Category       = g.Key.CategoryName,
                    TotalCourses   = g.Select(x => x.CourseId).Distinct().Count(),
                    Assigned       = assigned,
                    Completed      = completed,
                    CompletionRate = assigned > 0
                        ? Math.Round((double)completed / assigned * 100, 2)
                        : 0.0
                };
            }).ToList();

        // ── Top 3 most assigned courses ──────────────────────────────
        var rawCourseData = await (
            from course in _context.Courses
            join assignment in _context.CourseAssignments
                on course.Id equals assignment.CourseId into ag
            from assignment in ag.DefaultIfEmpty()
            select new
            {
                CourseId  = course.Id,
                Title     = course.Title,
                CourseUrl = course.CourseUrl,
                Status    = assignment != null ? assignment.Status : null
            }
        ).ToListAsync();

        var topCourses = rawCourseData
            .GroupBy(x => new { x.CourseId, x.Title, x.CourseUrl })
            .Select(g =>
            {
                var total     = g.Count(x => x.Status != null);
                var completed = g.Count(x => x.Status == "Completed");
                return new
                {
                    CourseId       = g.Key.CourseId,
                    Title          = g.Key.Title,
                    CourseUrl      = g.Key.CourseUrl,
                    TotalAssigned  = total,
                    Completed      = completed,
                    CompletionRate = total > 0
                        ? Math.Round((double)completed / total * 100, 2)
                        : 0.0
                };
            })
            .OrderByDescending(x => x.TotalAssigned)
            .Take(3)
            .ToList();

        // ── Activity feed (last 10) ───────────────────────────────────
        var completedActivities = await (
            from a in _context.CourseAssignments
            join emp in _context.Employees on a.EmployeeId equals emp.Id
            join course in _context.Courses on a.CourseId equals course.Id
            where a.Status == "Completed" && a.CompletionDate != null
            orderby a.CompletionDate descending
            select new
            {
                Id           = a.Id,
                Type         = "completed",
                EmployeeName = emp.FirstName + " " + emp.LastName,
                Action       = "completed",
                CourseTitle  = course.Title,
                Time         = a.CompletionDate
            }
        ).Take(10).ToListAsync();

        var startedActivities = await (
            from a in _context.CourseAssignments
            join emp in _context.Employees on a.EmployeeId equals emp.Id
            join course in _context.Courses on a.CourseId equals course.Id
            where a.Status == "InProgress" && a.StartDate != null
            orderby a.StartDate descending
            select new
            {
                Id           = a.Id,
                Type         = "started",
                EmployeeName = emp.FirstName + " " + emp.LastName,
                Action       = "started",
                CourseTitle  = course.Title,
                Time         = a.StartDate
            }
        ).Take(10).ToListAsync();

        var enrolledActivities = await (
            from a in _context.CourseAssignments
            join emp in _context.Employees on a.EmployeeId equals emp.Id
            join course in _context.Courses on a.CourseId equals course.Id
            where a.Status == "Assigned" || a.Status == "Pending"
            orderby a.CreatedAt descending
            select new
            {
                Id           = a.Id,
                Type         = "enrolled",
                EmployeeName = emp.FirstName + " " + emp.LastName,
                Action       = "enrolled in",
                CourseTitle  = course.Title,
                Time         = (DateTime?)a.CreatedAt
            }
        ).Take(10).ToListAsync();

        var activityFeed = completedActivities
            .Select(x => new { x.Id, x.Type, x.EmployeeName, x.Action, x.CourseTitle, x.Time })
            .Concat(startedActivities
                .Select(x => new { x.Id, x.Type, x.EmployeeName, x.Action, x.CourseTitle, x.Time }))
            .Concat(enrolledActivities
                .Select(x => new { x.Id, x.Type, x.EmployeeName, x.Action, x.CourseTitle, x.Time }))
            .OrderByDescending(x => x.Time)
            .Take(10)
            .ToList();

        // ── Overdue employees ────────────────────────────────────────
        // ✅ Fix: Load overdue verification parameters cleanly into memory 
        // to handle mixed database timezone schemas securely without throwing Postgres mapping errors
        var overdueEmployees = allAssignments
            .Where(a => a.DueDate.HasValue && 
                        (a.DueDate.Value.Kind == DateTimeKind.Utc ? a.DueDate.Value : a.DueDate.Value.ToUniversalTime()) < now && 
                        a.Status != "Completed")
            .Join(await _context.Employees.ToListAsync(), 
                a => a.EmployeeId, 
                e => e.Id, 
                (a, e) => e)
            .GroupBy(e => new { e.Id, e.FirstName, e.LastName, e.EmployeeCode })
            .OrderByDescending(g => g.Count())
            .Select(g => new
            {
                EmployeeId   = g.Key.Id,
                Name         = g.Key.FirstName + " " + g.Key.LastName,
                EmployeeCode = g.Key.EmployeeCode,
                OverdueCount = g.Count()
            })
            .ToList();

        // ── Recent certificates ──────────────────────────────────────
        var recentCertificates = await (
            from a in _context.CourseAssignments
            join emp in _context.Employees on a.EmployeeId equals emp.Id
            join course in _context.Courses on a.CourseId equals course.Id
            where a.CertificateUrl != null
            orderby a.CompletionDate descending
            select new
            {
                AssignmentId   = a.Id,
                EmployeeName   = emp.FirstName + " " + emp.LastName,
                CourseTitle    = course.Title,
                CertificateUrl = a.CertificateUrl,
                IssuedAt       = a.CompletionDate
            }
        ).Take(5).ToListAsync();

        return Ok(new
        {
            Success = true,
            Data = new
            {
                Stats = new
                {
                    TotalEmployees   = totalEmployees,
                    ActiveEmployees  = activeEmployees,
                    ActiveCourses    = activeCourses,
                    TotalAssignments = totalAssignments,
                    CompletionRate   = completionRate,
                    OverdueCount     = overdueCount,
                    CertsIssued      = certsIssued
                },
                StatusBreakdown    = statusBreakdown,
                CategoryBreakdown  = categoryBreakdown,
                TopCourses         = topCourses,
                ActivityFeed       = activityFeed,
                OverdueEmployees   = overdueEmployees,
                RecentCertificates = recentCertificates
            }
        });
    }
}