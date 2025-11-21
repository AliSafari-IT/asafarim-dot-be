using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestAutomation.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTestCaseGlobalMethods : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AfterEachStepHook",
                table: "TestCases",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AfterTestHook",
                table: "TestCases",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BeforeEachStepHook",
                table: "TestCases",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BeforeTestHook",
                table: "TestCases",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<JsonDocument>(
                name: "ClientScripts",
                table: "TestCases",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<JsonDocument>(
                name: "Meta",
                table: "TestCases",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Only",
                table: "TestCases",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PageUrl",
                table: "TestCases",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<JsonDocument>(
                name: "RequestHooks",
                table: "TestCases",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ScreenshotOnFail",
                table: "TestCases",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Skip",
                table: "TestCases",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SkipReason",
                table: "TestCases",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "VideoOnFail",
                table: "TestCases",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AfterEachStepHook",
                table: "TestCases");

            migrationBuilder.DropColumn(
                name: "AfterTestHook",
                table: "TestCases");

            migrationBuilder.DropColumn(
                name: "BeforeEachStepHook",
                table: "TestCases");

            migrationBuilder.DropColumn(
                name: "BeforeTestHook",
                table: "TestCases");

            migrationBuilder.DropColumn(
                name: "ClientScripts",
                table: "TestCases");

            migrationBuilder.DropColumn(
                name: "Meta",
                table: "TestCases");

            migrationBuilder.DropColumn(
                name: "Only",
                table: "TestCases");

            migrationBuilder.DropColumn(
                name: "PageUrl",
                table: "TestCases");

            migrationBuilder.DropColumn(
                name: "RequestHooks",
                table: "TestCases");

            migrationBuilder.DropColumn(
                name: "ScreenshotOnFail",
                table: "TestCases");

            migrationBuilder.DropColumn(
                name: "Skip",
                table: "TestCases");

            migrationBuilder.DropColumn(
                name: "SkipReason",
                table: "TestCases");

            migrationBuilder.DropColumn(
                name: "VideoOnFail",
                table: "TestCases");
        }
    }
}
