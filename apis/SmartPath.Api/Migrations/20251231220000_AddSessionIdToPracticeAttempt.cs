using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSessionIdToPracticeAttempt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PracticeSessionId",
                table: "PracticeAttempts",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PointsAwarded",
                table: "PracticeAttempts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_PracticeAttempts_PracticeSessionId",
                table: "PracticeAttempts",
                column: "PracticeSessionId");

            migrationBuilder.AddForeignKey(
                name: "FK_PracticeAttempts_PracticeSessions_PracticeSessionId",
                table: "PracticeAttempts",
                column: "PracticeSessionId",
                principalTable: "PracticeSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PracticeAttempts_PracticeSessions_PracticeSessionId",
                table: "PracticeAttempts");

            migrationBuilder.DropIndex(
                name: "IX_PracticeAttempts_PracticeSessionId",
                table: "PracticeAttempts");

            migrationBuilder.DropColumn(
                name: "PracticeSessionId",
                table: "PracticeAttempts");

            migrationBuilder.DropColumn(
                name: "PointsAwarded",
                table: "PracticeAttempts");
        }
    }
}
