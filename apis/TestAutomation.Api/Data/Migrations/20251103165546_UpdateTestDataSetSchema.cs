using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestAutomation.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTestDataSetSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpectedOutput",
                table: "TestDataSets");

            migrationBuilder.RenameColumn(
                name: "InputData",
                table: "TestDataSets",
                newName: "Data");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedById",
                table: "TestDataSets",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedById",
                table: "TestDataSets",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "TestDataSets");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "TestDataSets");

            migrationBuilder.RenameColumn(
                name: "Data",
                table: "TestDataSets",
                newName: "InputData");

            migrationBuilder.AddColumn<string>(
                name: "ExpectedOutput",
                table: "TestDataSets",
                type: "jsonb",
                nullable: true);
        }
    }
}
