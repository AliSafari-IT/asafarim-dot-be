using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KidCode.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAlbumVisibilityAndDescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Albums",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Visibility",
                table: "Albums",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 22, 15, 6, 791, DateTimeKind.Utc).AddTicks(1755));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 22, 15, 6, 791, DateTimeKind.Utc).AddTicks(1777));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 22, 15, 6, 791, DateTimeKind.Utc).AddTicks(1782));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 22, 15, 6, 791, DateTimeKind.Utc).AddTicks(1787));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 22, 15, 6, 791, DateTimeKind.Utc).AddTicks(1793));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 22, 15, 6, 791, DateTimeKind.Utc).AddTicks(1797));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 22, 15, 6, 791, DateTimeKind.Utc).AddTicks(1801));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Albums");

            migrationBuilder.DropColumn(
                name: "Visibility",
                table: "Albums");

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 21, 0, 57, 543, DateTimeKind.Utc).AddTicks(6466));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 21, 0, 57, 543, DateTimeKind.Utc).AddTicks(6485));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 21, 0, 57, 543, DateTimeKind.Utc).AddTicks(6490));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 21, 0, 57, 543, DateTimeKind.Utc).AddTicks(6494));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 21, 0, 57, 543, DateTimeKind.Utc).AddTicks(6498));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 21, 0, 57, 543, DateTimeKind.Utc).AddTicks(6502));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 21, 0, 57, 543, DateTimeKind.Utc).AddTicks(6505));
        }
    }
}
