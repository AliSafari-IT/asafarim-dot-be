using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TestAutomation.Api.Data;
using TestAutomation.Api.Models;

namespace TestAutomation.Api.Services;

public class TestCafeGeneratorService
{
    private readonly TestAutomationDbContext _db;

    public TestCafeGeneratorService(TestAutomationDbContext db)
    {
        _db = db;
    }

    public async Task<string> GenerateTestCafeFileAsync(Guid testSuiteId)
    {
        var testSuite = await _db
            .TestSuites.Include(ts => ts.Fixture)
            .Include(ts => ts.TestCases)
            .FirstOrDefaultAsync(ts => ts.Id == testSuiteId);

        if (testSuite == null)
            throw new InvalidOperationException($"Test suite {testSuiteId} not found");

        var sb = new StringBuilder();

        // Add imports
        sb.AppendLine("import { Selector } from 'testcafe';");
        sb.AppendLine();

        // Add fixture
        sb.AppendLine($"fixture('{EscapeString(testSuite.Name)}')");
        sb.AppendLine($"    .page('{EscapeString(testSuite.Fixture.PageUrl)}')");

        // Add setup script if exists
        if (testSuite.Fixture.SetupScript != null)
        {
            var setupScript = testSuite.Fixture.SetupScript.RootElement.GetString();
            if (!string.IsNullOrEmpty(setupScript))
            {
                sb.AppendLine("    .beforeEach(async t => {");
                sb.AppendLine($"        {IndentCode(setupScript, 8)}");
                sb.AppendLine("    })");
            }
        }

        // Add teardown script if exists
        if (testSuite.Fixture.TeardownScript != null)
        {
            var teardownScript = testSuite.Fixture.TeardownScript.RootElement.GetString();
            if (!string.IsNullOrEmpty(teardownScript))
            {
                sb.AppendLine("    .afterEach(async t => {");
                sb.AppendLine($"        {IndentCode(teardownScript, 8)}");
                sb.AppendLine("    })");
            }
        }

        sb.AppendLine(";");
        sb.AppendLine();

        // Generate test cases
        foreach (
            var testCase in testSuite.TestCases.Where(tc => tc.IsActive).OrderBy(tc => tc.Name)
        )
        {
            sb.AppendLine($"test('{EscapeString(testCase.Name)}', async t => {{");

            if (testCase.TestType == TestType.Steps && testCase.Steps != null)
            {
                // Generate steps-based test
                try
                {
                    var stepsJson = testCase.Steps.RootElement.GetRawText();
                    Console.WriteLine($"[TestCafe Generator] Raw Steps JSON for test '{testCase.Name}': {stepsJson}");
                    
                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };
                    var steps = JsonSerializer.Deserialize<List<TestStep>>(stepsJson, options);
                    
                    Console.WriteLine($"[TestCafe Generator] Deserialized {steps?.Count ?? 0} steps");
                    
                    if (steps != null && steps.Count > 0)
                    {
                        foreach (var step in steps)
                        {
                            Console.WriteLine($"[TestCafe Generator] Step - Action: '{step.Action}', Selector: '{step.Selector}', Value: '{step.Value}'");
                            sb.AppendLine($"    // Step: {EscapeString(step.Description ?? "")}");
                            sb.AppendLine($"    {GenerateStepCode(step)}");
                        }
                    }
                    else
                    {
                        sb.AppendLine("    // No steps found or deserialization failed");
                        Console.WriteLine($"[TestCafe Generator] WARNING: No steps found for test '{testCase.Name}'");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[TestCafe Generator] ERROR deserializing steps: {ex.Message}");
                    sb.AppendLine($"    // Error deserializing steps: {ex.Message}");
                }
            }
            else if (
                testCase.TestType == TestType.Script
                && !string.IsNullOrEmpty(testCase.ScriptText)
            )
            {
                // Generate script-based test
                sb.AppendLine(IndentCode(testCase.ScriptText, 4));
            }

            sb.AppendLine("});");
            sb.AppendLine();
        }

        return sb.ToString();
    }

    private string GenerateStepCode(TestStep step)
    {
        var code = new StringBuilder();

        // Add description as comment if provided
        if (!string.IsNullOrEmpty(step.Description))
        {
            code.AppendLine($"// {EscapeString(step.Description)}");
        }

        var action = step.Action?.ToLower() ?? "";

        switch (action)
        {
            case "click":
                if (!string.IsNullOrEmpty(step.Selector))
                    code.Append($"await t.click(Selector('{EscapeString(step.Selector)}'));");
                break;

            case "type":
                if (!string.IsNullOrEmpty(step.Selector) && !string.IsNullOrEmpty(step.Value))
                    code.Append(
                        $"await t.typeText(Selector('{EscapeString(step.Selector)}'), '{EscapeString(step.Value)}', {{ replace: true }});"
                    );
                break;

            case "navigate":
                if (!string.IsNullOrEmpty(step.Value))
                    code.Append($"await t.navigateTo('{EscapeString(step.Value)}');");
                break;

            case "wait":
                var waitTime = step.Value ?? "1000";
                code.Append($"await t.wait({waitTime});");
                break;

            case "hover":
                if (!string.IsNullOrEmpty(step.Selector))
                    code.Append($"await t.hover(Selector('{EscapeString(step.Selector)}'));");
                break;

            case "expect":
            case "assert":
                if (!string.IsNullOrEmpty(step.Selector))
                {
                    var assertionType = step.AssertionType?.ToLower() ?? "exists";
                    switch (assertionType)
                    {
                        case "exists":
                            code.Append(
                                $"await t.expect(Selector('{EscapeString(step.Selector)}').exists).ok();"
                            );
                            break;
                        case "visible":
                            code.Append(
                                $"await t.expect(Selector('{EscapeString(step.Selector)}').visible).ok();"
                            );
                            break;
                        case "contains":
                            if (!string.IsNullOrEmpty(step.AssertionValue))
                                code.Append(
                                    $"await t.expect(Selector('{EscapeString(step.Selector)}').innerText).contains('{EscapeString(step.AssertionValue)}');"
                                );
                            break;
                        case "eql":
                        case "equals":
                            if (!string.IsNullOrEmpty(step.AssertionValue))
                                code.Append(
                                    $"await t.expect(Selector('{EscapeString(step.Selector)}').innerText).eql('{EscapeString(step.AssertionValue)}');"
                                );
                            break;
                        case "count":
                            if (!string.IsNullOrEmpty(step.AssertionValue))
                                code.Append(
                                    $"await t.expect(Selector('{EscapeString(step.Selector)}').count).eql({step.AssertionValue});"
                                );
                            break;
                        default:
                            code.Append(
                                $"await t.expect(Selector('{EscapeString(step.Selector)}').exists).ok();"
                            );
                            break;
                    }
                }
                break;

            case "selecttext":
            case "select":
                if (!string.IsNullOrEmpty(step.Selector) && !string.IsNullOrEmpty(step.Value))
                    code.Append(
                        $"await t.click(Selector('{EscapeString(step.Selector)}')).click(Selector('{EscapeString(step.Selector)} option').withText('{EscapeString(step.Value)}'));"
                    );
                break;

            case "presskey":
                if (!string.IsNullOrEmpty(step.Value))
                    code.Append($"await t.pressKey('{EscapeString(step.Value)}');");
                break;

            case "screenshot":
                var screenshotName = step.Value ?? "screenshot";
                code.Append($"await t.takeScreenshot('{EscapeString(screenshotName)}');");
                break;

            default:
                code.Append($"// Unknown action: {step.Action}");
                break;
        }

        return code.ToString();
    }

    private string EscapeString(string input)
    {
        return input.Replace("'", "\\'").Replace("\n", "\\n").Replace("\r", "");
    }

    private string IndentCode(string code, int spaces)
    {
        var indent = new string(' ', spaces);
        return string.Join("\n" + indent, code.Split('\n'));
    }
}

public class TestStep
{
    public string Action { get; set; } = string.Empty; // click, type, navigate, wait, expect, hover, etc.
    public string? Selector { get; set; } // CSS selector for the element
    public string? Value { get; set; } // Value for type actions, URL for navigate, milliseconds for wait
    public string? Description { get; set; } // Human-readable description
    public string? AssertionType { get; set; } // exists, visible, contains, eql, etc.
    public string? AssertionValue { get; set; } // Expected value for assertions
}
