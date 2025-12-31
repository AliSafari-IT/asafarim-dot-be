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
                name: "SessionId",
                table: "PracticeAttempts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_PracticeAttempts_SessionId",
                table: "PracticeAttempts",
                column: "SessionId");

            migrationBuilder.AddForeignKey(
                name: "FK_PracticeAttempts_PracticeSessions_SessionId",
                table: "PracticeAttempts",
                column: "SessionId",
                principalTable: "PracticeSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PracticeAttempts_PracticeSessions_SessionId",
                table: "PracticeAttempts");

            migrationBuilder.DropIndex(
                name: "IX_PracticeAttempts_SessionId",
                table: "PracticeAttempts");

            migrationBuilder.DropColumn(
                name: "SessionId",
                table: "PracticeAttempts");
        }
    }
}
