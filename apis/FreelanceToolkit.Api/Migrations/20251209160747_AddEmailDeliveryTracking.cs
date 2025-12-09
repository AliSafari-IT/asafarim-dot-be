using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FreelanceToolkit.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailDeliveryTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DeliveryStatus",
                table: "Proposals",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastAttemptAt",
                table: "Proposals",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RetryCount",
                table: "Proposals",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DeliveryStatus",
                table: "Invoices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastAttemptAt",
                table: "Invoices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RetryCount",
                table: "Invoices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DeliveryStatus",
                table: "CalendarBookings",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastAttemptAt",
                table: "CalendarBookings",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RetryCount",
                table: "CalendarBookings",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeliveryStatus",
                table: "Proposals");

            migrationBuilder.DropColumn(
                name: "LastAttemptAt",
                table: "Proposals");

            migrationBuilder.DropColumn(
                name: "RetryCount",
                table: "Proposals");

            migrationBuilder.DropColumn(
                name: "DeliveryStatus",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "LastAttemptAt",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "RetryCount",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "DeliveryStatus",
                table: "CalendarBookings");

            migrationBuilder.DropColumn(
                name: "LastAttemptAt",
                table: "CalendarBookings");

            migrationBuilder.DropColumn(
                name: "RetryCount",
                table: "CalendarBookings");
        }
    }
}
