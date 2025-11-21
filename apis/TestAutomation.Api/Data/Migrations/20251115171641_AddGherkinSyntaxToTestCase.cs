using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestAutomation.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGherkinSyntaxToTestCase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GherkinSyntax",
                table: "TestCases",
                type: "text",
                nullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "GherkinSyntax", table: "TestCases");
        }
    }
}
