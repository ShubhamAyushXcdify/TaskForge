using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LearnTrack.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ApplyLowerCaseNaming : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_CourseProviders",
                table: "CourseProviders");

            migrationBuilder.RenameTable(
                name: "CourseProviders",
                newName: "courseproviders");

            migrationBuilder.AddPrimaryKey(
                name: "PK_courseproviders",
                table: "courseproviders",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_courseproviders",
                table: "courseproviders");

            migrationBuilder.RenameTable(
                name: "courseproviders",
                newName: "CourseProviders");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CourseProviders",
                table: "CourseProviders",
                column: "Id");
        }
    }
}
