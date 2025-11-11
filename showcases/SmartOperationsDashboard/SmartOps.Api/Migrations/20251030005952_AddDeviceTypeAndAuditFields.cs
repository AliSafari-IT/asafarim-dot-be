using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartOps.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDeviceTypeAndAuditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Readings",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "Readings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Readings",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Readings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSeen",
                table: "Devices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Devices",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Readings");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Readings");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Readings");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Readings");

            migrationBuilder.DropColumn(
                name: "LastSeen",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Devices");
        }
    }
}
