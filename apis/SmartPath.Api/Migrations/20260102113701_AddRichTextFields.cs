using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SmartPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRichTextFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PracticeAttempts_PracticeSessions_PracticeSessionId",
                table: "PracticeAttempts"
            );

            migrationBuilder.DropTable(name: "GraphEdges");

            migrationBuilder.DropTable(name: "PathRuns");

            migrationBuilder.DropTable(name: "GraphNodes");

            migrationBuilder.DropTable(name: "Graphs");

            migrationBuilder.AddColumn<string>(
                name: "QuestionHtml",
                table: "PracticeItems",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "QuestionJson",
                table: "PracticeItems",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "DescriptionHtml",
                table: "Lessons",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "DescriptionJson",
                table: "Lessons",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "LearningObjectivesHtml",
                table: "Lessons",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "LearningObjectivesJson",
                table: "Lessons",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddForeignKey(
                name: "FK_PracticeAttempts_PracticeSessions_PracticeSessionId",
                table: "PracticeAttempts",
                column: "PracticeSessionId",
                principalTable: "PracticeSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PracticeAttempts_PracticeSessions_PracticeSessionId",
                table: "PracticeAttempts"
            );

            migrationBuilder.DropColumn(name: "QuestionHtml", table: "PracticeItems");

            migrationBuilder.DropColumn(name: "QuestionJson", table: "PracticeItems");

            migrationBuilder.DropColumn(name: "DescriptionHtml", table: "Lessons");

            migrationBuilder.DropColumn(name: "DescriptionJson", table: "Lessons");

            migrationBuilder.DropColumn(name: "LearningObjectivesHtml", table: "Lessons");

            migrationBuilder.DropColumn(name: "LearningObjectivesJson", table: "Lessons");

            migrationBuilder.CreateTable(
                name: "Graphs",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Graphs", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "GraphNodes",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    GraphId = table.Column<int>(type: "integer", nullable: false),
                    Label = table.Column<string>(type: "text", nullable: false),
                    Metadata = table.Column<string>(type: "text", nullable: true),
                    X = table.Column<double>(type: "double precision", nullable: false),
                    Y = table.Column<double>(type: "double precision", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GraphNodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GraphNodes_Graphs_GraphId",
                        column: x => x.GraphId,
                        principalTable: "Graphs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "PathRuns",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    GraphId = table.Column<int>(type: "integer", nullable: false),
                    Algorithm = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    EndNodeId = table.Column<int>(type: "integer", nullable: false),
                    StartNodeId = table.Column<int>(type: "integer", nullable: false),
                    TotalCost = table.Column<double>(type: "double precision", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PathRuns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PathRuns_Graphs_GraphId",
                        column: x => x.GraphId,
                        principalTable: "Graphs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "GraphEdges",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    FromNodeId = table.Column<int>(type: "integer", nullable: false),
                    GraphId = table.Column<int>(type: "integer", nullable: false),
                    ToNodeId = table.Column<int>(type: "integer", nullable: false),
                    IsDirected = table.Column<bool>(type: "boolean", nullable: false),
                    Weight = table.Column<double>(type: "double precision", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GraphEdges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GraphEdges_GraphNodes_FromNodeId",
                        column: x => x.FromNodeId,
                        principalTable: "GraphNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "FK_GraphEdges_GraphNodes_ToNodeId",
                        column: x => x.ToNodeId,
                        principalTable: "GraphNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "FK_GraphEdges_Graphs_GraphId",
                        column: x => x.GraphId,
                        principalTable: "Graphs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_GraphEdges_FromNodeId",
                table: "GraphEdges",
                column: "FromNodeId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_GraphEdges_GraphId",
                table: "GraphEdges",
                column: "GraphId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_GraphEdges_ToNodeId",
                table: "GraphEdges",
                column: "ToNodeId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_GraphNodes_GraphId",
                table: "GraphNodes",
                column: "GraphId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_PathRuns_GraphId",
                table: "PathRuns",
                column: "GraphId"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_PracticeAttempts_PracticeSessions_PracticeSessionId",
                table: "PracticeAttempts",
                column: "PracticeSessionId",
                principalTable: "PracticeSessions",
                principalColumn: "Id"
            );
        }
    }
}
