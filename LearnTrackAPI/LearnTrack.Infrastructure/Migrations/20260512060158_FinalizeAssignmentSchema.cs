using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LearnTrack.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FinalizeAssignmentSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "duedate",
                table: "courseassignments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "lastaccessedat",
                table: "courseassignments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "updatedat",
                table: "courseassignments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_courseassignments_employeeid",
                table: "courseassignments",
                column: "employeeid");

            migrationBuilder.AddForeignKey(
                name: "FK_courseassignments_employees_employeeid",
                table: "courseassignments",
                column: "employeeid",
                principalTable: "employees",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_courseassignments_employees_employeeid",
                table: "courseassignments");

            migrationBuilder.DropIndex(
                name: "IX_courseassignments_employeeid",
                table: "courseassignments");

            migrationBuilder.DropColumn(
                name: "duedate",
                table: "courseassignments");

            migrationBuilder.DropColumn(
                name: "lastaccessedat",
                table: "courseassignments");

            migrationBuilder.DropColumn(
                name: "updatedat",
                table: "courseassignments");
        }
    }
}
