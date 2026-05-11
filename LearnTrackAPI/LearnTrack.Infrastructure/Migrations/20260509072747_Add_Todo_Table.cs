
using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LearnTrack.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Add_Todo_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "courses");

            migrationBuilder.AddColumn<bool>(
                name: "isactive",
                table: "employees",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<decimal>(
                name: "DurationHours",
                table: "courses",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "Website",
                table: "courseproviders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "coursecategories",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "todos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_todos", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_employees_userid",
                table: "employees",
                column: "userid");

            migrationBuilder.CreateIndex(
                name: "IX_courses_CourseCategoryId",
                table: "courses",
                column: "CourseCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_courses_CourseProviderId",
                table: "courses",
                column: "CourseProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_courseassignments_courseid",
                table: "courseassignments",
                column: "courseid");

            migrationBuilder.AddForeignKey(
                name: "FK_courseassignments_courses_courseid",
                table: "courseassignments",
                column: "courseid",
                principalTable: "courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_courses_coursecategories_CourseCategoryId",
                table: "courses",
                column: "CourseCategoryId",
                principalTable: "coursecategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_courses_courseproviders_CourseProviderId",
                table: "courses",
                column: "CourseProviderId",
                principalTable: "courseproviders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_employees_users_userid",
                table: "employees",
                column: "userid",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_courseassignments_courses_courseid",
                table: "courseassignments");

            migrationBuilder.DropForeignKey(
                name: "FK_courses_coursecategories_CourseCategoryId",
                table: "courses");

            migrationBuilder.DropForeignKey(
                name: "FK_courses_courseproviders_CourseProviderId",
                table: "courses");

            migrationBuilder.DropForeignKey(
                name: "FK_employees_users_userid",
                table: "employees");

            migrationBuilder.DropTable(
                name: "todos");

            migrationBuilder.DropIndex(
                name: "IX_employees_userid",
                table: "employees");

            migrationBuilder.DropIndex(
                name: "IX_courses_CourseCategoryId",
                table: "courses");

            migrationBuilder.DropIndex(
                name: "IX_courses_CourseProviderId",
                table: "courses");

            migrationBuilder.DropIndex(
                name: "IX_courseassignments_courseid",
                table: "courseassignments");

            migrationBuilder.DropColumn(
                name: "isactive",
                table: "employees");

            migrationBuilder.DropColumn(
                name: "Website",
                table: "courseproviders");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "coursecategories");

            migrationBuilder.AlterColumn<int>(
                name: "DurationHours",
                table: "courses",
                type: "integer",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "courses",
                type: "timestamp with time zone",
                nullable: true);
        }
    }
}