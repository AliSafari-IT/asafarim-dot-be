using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SmartPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGraphEntitiesPracticeAndRewards : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PracticeSessionId",
                table: "PracticeAttempts",
                type: "integer",
                nullable: true
            );

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
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
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
                name: "PracticeSessions",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    FamilyId = table.Column<int>(type: "integer", nullable: false),
                    ChildUserId = table.Column<int>(type: "integer", nullable: false),
                    LessonId = table.Column<int>(type: "integer", nullable: false),
                    StartedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    EndedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    TotalPoints = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticeSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PracticeSessions_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "FamilyId",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_PracticeSessions_Lessons_LessonId",
                        column: x => x.LessonId,
                        principalTable: "Lessons",
                        principalColumn: "LessonId",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_PracticeSessions_Users_ChildUserId",
                        column: x => x.ChildUserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "StreakEntities",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    ChildUserId = table.Column<int>(type: "integer", nullable: false),
                    CurrentDays = table.Column<int>(type: "integer", nullable: false),
                    BestDays = table.Column<int>(type: "integer", nullable: false),
                    LastActivityDate = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StreakEntities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StreakEntities_Users_ChildUserId",
                        column: x => x.ChildUserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade
                    );
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
                    X = table.Column<double>(type: "double precision", nullable: false),
                    Y = table.Column<double>(type: "double precision", nullable: false),
                    Metadata = table.Column<string>(type: "text", nullable: true),
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
                    StartNodeId = table.Column<int>(type: "integer", nullable: false),
                    EndNodeId = table.Column<int>(type: "integer", nullable: false),
                    Algorithm = table.Column<string>(type: "text", nullable: false),
                    TotalCost = table.Column<double>(type: "double precision", nullable: false),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
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
                    GraphId = table.Column<int>(type: "integer", nullable: false),
                    FromNodeId = table.Column<int>(type: "integer", nullable: false),
                    ToNodeId = table.Column<int>(type: "integer", nullable: false),
                    Weight = table.Column<double>(type: "double precision", nullable: false),
                    IsDirected = table.Column<bool>(type: "boolean", nullable: false),
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
                name: "IX_PracticeAttempts_PracticeSessionId",
                table: "PracticeAttempts",
                column: "PracticeSessionId"
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

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessions_ChildUserId",
                table: "PracticeSessions",
                column: "ChildUserId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessions_FamilyId",
                table: "PracticeSessions",
                column: "FamilyId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSessions_LessonId",
                table: "PracticeSessions",
                column: "LessonId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_StreakEntities_ChildUserId",
                table: "StreakEntities",
                column: "ChildUserId"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_PracticeAttempts_PracticeSessions_PracticeSessionId",
                table: "PracticeAttempts",
                column: "PracticeSessionId",
                principalTable: "PracticeSessions",
                principalColumn: "Id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PracticeAttempts_PracticeSessions_PracticeSessionId",
                table: "PracticeAttempts"
            );

            migrationBuilder.DropTable(name: "GraphEdges");

            migrationBuilder.DropTable(name: "PathRuns");

            migrationBuilder.DropTable(name: "PracticeSessions");

            migrationBuilder.DropTable(name: "StreakEntities");

            migrationBuilder.DropTable(name: "GraphNodes");

            migrationBuilder.DropTable(name: "Graphs");

            migrationBuilder.DropIndex(
                name: "IX_PracticeAttempts_PracticeSessionId",
                table: "PracticeAttempts"
            );

            migrationBuilder.DropColumn(name: "PracticeSessionId", table: "PracticeAttempts");
        }
    }
}
