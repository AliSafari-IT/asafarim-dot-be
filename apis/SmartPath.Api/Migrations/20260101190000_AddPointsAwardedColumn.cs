using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPointsAwardedColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PointsAwarded",
                table: "PracticeAttempts",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PointsAwarded",
                table: "PracticeAttempts");
        }
    }
}
