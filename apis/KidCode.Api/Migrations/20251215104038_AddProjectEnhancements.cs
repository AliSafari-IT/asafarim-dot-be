using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KidCode.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDraft",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastAutoSaveAt",
                table: "Projects",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModeDataJson",
                table: "Projects",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ProjectId",
                table: "MediaAssets",
                type: "uuid",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 15, 10, 40, 33, 634, DateTimeKind.Utc).AddTicks(8851));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 15, 10, 40, 33, 634, DateTimeKind.Utc).AddTicks(8873));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 15, 10, 40, 33, 634, DateTimeKind.Utc).AddTicks(8880));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 15, 10, 40, 33, 634, DateTimeKind.Utc).AddTicks(8886));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 15, 10, 40, 33, 634, DateTimeKind.Utc).AddTicks(8891));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 15, 10, 40, 33, 634, DateTimeKind.Utc).AddTicks(8896));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 15, 10, 40, 33, 634, DateTimeKind.Utc).AddTicks(8901));

            migrationBuilder.CreateIndex(
                name: "IX_Projects_UserId_Mode_IsDraft",
                table: "Projects",
                columns: new[] { "UserId", "Mode", "IsDraft" });

            migrationBuilder.CreateIndex(
                name: "IX_MediaAssets_ProjectId",
                table: "MediaAssets",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_MediaAssets_Projects_ProjectId",
                table: "MediaAssets",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MediaAssets_Projects_ProjectId",
                table: "MediaAssets");

            migrationBuilder.DropIndex(
                name: "IX_Projects_UserId_Mode_IsDraft",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_MediaAssets_ProjectId",
                table: "MediaAssets");

            migrationBuilder.DropColumn(
                name: "IsDraft",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "LastAutoSaveAt",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ModeDataJson",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "MediaAssets");

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
    }
}
