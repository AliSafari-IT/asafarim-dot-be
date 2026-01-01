using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddClientNodeIdToGraphNode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ClientNodeId",
                table: "GraphNodes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_GraphNodes_GraphId_ClientNodeId",
                table: "GraphNodes",
                columns: new[] { "GraphId", "ClientNodeId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_GraphNodes_GraphId_ClientNodeId",
                table: "GraphNodes");

            migrationBuilder.DropColumn(
                name: "ClientNodeId",
                table: "GraphNodes");
        }
    }
}
