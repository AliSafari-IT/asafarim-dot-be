using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KidCode.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEarnedStickersAndScriptJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EarnedStickersJson",
                table: "Progresses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ScriptJson",
                table: "MediaAssets",
                type: "text",
                nullable: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EarnedStickersJson",
                table: "Progresses");

            migrationBuilder.DropColumn(
                name: "ScriptJson",
                table: "MediaAssets");

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 19, 25, 42, 725, DateTimeKind.Utc).AddTicks(3470));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 19, 25, 42, 725, DateTimeKind.Utc).AddTicks(3488));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 19, 25, 42, 725, DateTimeKind.Utc).AddTicks(3493));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 19, 25, 42, 725, DateTimeKind.Utc).AddTicks(3499));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 19, 25, 42, 725, DateTimeKind.Utc).AddTicks(3503));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 19, 25, 42, 725, DateTimeKind.Utc).AddTicks(3506));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 19, 25, 42, 725, DateTimeKind.Utc).AddTicks(3509));
        }
    }
}
