using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestAutomation.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTestFixtureGlobalMethods : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AfterEachHook",
                table: "TestFixtures",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AfterHook",
                table: "TestFixtures",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BeforeEachHook",
                table: "TestFixtures",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BeforeHook",
                table: "TestFixtures",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClientScripts",
                table: "TestFixtures",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HttpAuthPassword",
                table: "TestFixtures",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HttpAuthUsername",
                table: "TestFixtures",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Metadata",
                table: "TestFixtures",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequestHooks",
                table: "TestFixtures",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AfterEachHook",
                table: "TestFixtures");

            migrationBuilder.DropColumn(
                name: "AfterHook",
                table: "TestFixtures");

            migrationBuilder.DropColumn(
                name: "BeforeEachHook",
                table: "TestFixtures");

            migrationBuilder.DropColumn(
                name: "BeforeHook",
                table: "TestFixtures");

            migrationBuilder.DropColumn(
                name: "ClientScripts",
                table: "TestFixtures");

            migrationBuilder.DropColumn(
                name: "HttpAuthPassword",
                table: "TestFixtures");

            migrationBuilder.DropColumn(
                name: "HttpAuthUsername",
                table: "TestFixtures");

            migrationBuilder.DropColumn(
                name: "Metadata",
                table: "TestFixtures");

            migrationBuilder.DropColumn(
                name: "RequestHooks",
                table: "TestFixtures");
        }
    }
}
