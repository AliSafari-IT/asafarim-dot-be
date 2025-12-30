// apis/TestAutomation.Api/Services/TestCafeGeneratorService.cs
using System.IO;
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

    public async Task<(string filePath, string content)> GenerateTestCafeFileAsync(Guid testSuiteId)
    {
        var testSuite = await _db
            .TestSuites.Include(ts => ts.Fixture)
            .ThenInclude(f => f.FunctionalRequirement)
            .Include(ts => ts.TestCases)
            .FirstOrDefaultAsync(ts => ts.Id == testSuiteId);

        if (testSuite == null)
            throw new InvalidOperationException($"Test suite {testSuiteId} not found");

        Console.WriteLine(
            $"[TestCafe Generator] Generating tests for fixture: \"{testSuite.Fixture.Name}\""
        );

        var sb = new StringBuilder();

        // Split tests by type for clearer generation phases
        var scriptTests = testSuite
            .TestCases.Where(tc =>
                tc.IsActive
                && tc.TestType == TestType.Script
                && !string.IsNullOrEmpty(tc.ScriptText)
            )
            .OrderBy(tc => tc.Name)
            .ToList();
        var stepTests = testSuite
            .TestCases.Where(tc => tc.IsActive && tc.TestType == TestType.Steps)
            .OrderBy(tc => tc.Name)
            .ToList();

        // Aggregate import lines and extract components from script tests
        var importLines = new HashSet<string>(StringComparer.Ordinal);
        var extractedSelectors = new Dictionary<string, string>(StringComparer.Ordinal); // Map variable name to full selector line
        var extractedFunctions = new List<string>();
        var cleanedTestBlocks = new List<string>();

        foreach (var st in scriptTests)
        {
            var (imports, body) = ExtractImportsAndBody(st.ScriptText!);
            foreach (var imp in imports)
                importLines.Add(imp);

            if (!string.IsNullOrWhiteSpace(body))
            {
                var normalized = UnescapeCommonEscapes(body);
                var cleanedBody = RemoveTypeScriptAnnotations(normalized);

                // Extract selectors and functions from script body
                var (selectors, functions, testCode) = ExtractSelectorsAndFunctions(
                    cleanedBody,
                    st.Id
                );
                foreach (var sel in selectors)
                {
                    var varName = ExtractVariableName(sel);
                    if (!string.IsNullOrEmpty(varName))
                        extractedSelectors[varName] = sel; // Deduplicate by variable name
                }
                extractedFunctions.AddRange(functions);
                cleanedTestBlocks.Add(testCode.Trim());
            }
        }

        // Extract imports from SharedImportsContent and add to importLines
        if (!string.IsNullOrEmpty(testSuite.Fixture.SharedImportsContent))
        {
            var sharedImportsContent = testSuite.Fixture.SharedImportsContent;
            var (sharedImports, sharedNonImports) = ExtractImportsAndBody(sharedImportsContent);
            foreach (var imp in sharedImports)
                importLines.Add(imp);

            Console.WriteLine(
                $"  ✓ Extracted {sharedImports.Count} imports from SharedImportsContent"
            );
        }

        // Collect required imports for steps-based tests
        var requiredImports = new List<string>();
        if (stepTests.Any())
            requiredImports.Add("Selector");

        if (
            stepTests.Any()
            && (
                !string.IsNullOrEmpty(testSuite.Fixture.RequestHooks)
                || stepTests.Any(tc => tc.RequestHooks != null)
            )
        )
        {
            requiredImports.AddRange(new[] { "RequestLogger", "RequestMock" });
        }

        // Merge imports intelligently to avoid duplicates
        var finalImports = MergeImports(importLines.ToList(), requiredImports);

        // Write all imports at the very top (deduplicated)
        foreach (var line in finalImports)
            sb.AppendLine(line);
        if (finalImports.Count > 0)
            sb.AppendLine();

        // Add shared imports if configured
        if (!string.IsNullOrEmpty(testSuite.Fixture.SharedImportsPath))
        {
            sb.AppendLine($"import {{ ... }} from '{testSuite.Fixture.SharedImportsPath}';");
            sb.AppendLine();
            Console.WriteLine(
                $"  ✓ Added shared imports from: {testSuite.Fixture.SharedImportsPath}"
            );
        }

        // Add non-import content from SharedImportsContent (selectors, functions, etc.)
        if (!string.IsNullOrEmpty(testSuite.Fixture.SharedImportsContent))
        {
            var sharedImportsContent = testSuite.Fixture.SharedImportsContent;
            var (sharedImports, sharedNonImports) = ExtractImportsAndBody(sharedImportsContent);

            // Filter out require('dotenv').config() from non-import content
            var lines = sharedNonImports
                .Split('\n')
                .Where(line =>
                    !line.Trim().StartsWith("require('dotenv')")
                    && !line.Trim().StartsWith("require(\"dotenv\")")
                )
                .ToList();

            var filteredContent = string.Join('\n', lines).Trim();
            if (!string.IsNullOrEmpty(filteredContent))
            {
                sb.AppendLine(filteredContent);
                sb.AppendLine();
                Console.WriteLine(
                    $"  ✓ Added {filteredContent.Length} chars of shared non-import content (filtered dotenv)"
                );
            }
        }

        Console.WriteLine($"  ✓ Merged {finalImports.Count} unique import statements");

        // Process ALL hooks and scripts to extract functions and selectors
        var setupScript = string.Empty;
        var beforeHookCode = string.Empty;
        var afterHookCode = string.Empty;
        var beforeEachHookCode = string.Empty;
        var afterEachHookCode = string.Empty;
        var extractedTeardownScript = string.Empty;
        var setupFunctions = new List<string>();
        var setupSelectors = new Dictionary<string, string>(StringComparer.Ordinal); // Deduplicate by variable name

        // Extract from SetupScript
        if (testSuite.Fixture.SetupScript != null)
        {
            var rawSetupScript = testSuite.Fixture.SetupScript.RootElement.GetString();
            if (!string.IsNullOrEmpty(rawSetupScript))
            {
                Console.WriteLine(
                    $"[TestCafe Generator] Processing SetupScript ({rawSetupScript.Length} chars)"
                );
                var (extractedFuncs, extractedSels, remainingCode) =
                    ExtractFunctionsAndSelectorsFromSetup(rawSetupScript);
                setupFunctions.AddRange(extractedFuncs);
                foreach (var sel in extractedSels)
                {
                    var varName = ExtractVariableName(sel);
                    if (!string.IsNullOrEmpty(varName))
                        setupSelectors[varName] = sel; // Deduplicate by variable name
                }
                setupScript = remainingCode;
                Console.WriteLine(
                    $"  ✓ Extracted {extractedFuncs.Count} functions, {extractedSels.Count} selectors from SetupScript"
                );
            }
        }

        // Extract from TeardownScript
        if (testSuite.Fixture.TeardownScript != null)
        {
            var rawTeardownScript = testSuite.Fixture.TeardownScript.RootElement.GetString();
            if (!string.IsNullOrEmpty(rawTeardownScript))
            {
                Console.WriteLine(
                    $"[TestCafe Generator] Processing TeardownScript ({rawTeardownScript.Length} chars)"
                );
                var (extractedFuncs, extractedSels, remainingCode) =
                    ExtractFunctionsAndSelectorsFromSetup(rawTeardownScript);
                setupFunctions.AddRange(extractedFuncs);
                foreach (var sel in extractedSels)
                {
                    var varName = ExtractVariableName(sel);
                    if (!string.IsNullOrEmpty(varName))
                        setupSelectors[varName] = sel; // Deduplicate by variable name
                }
                extractedTeardownScript = remainingCode;
                Console.WriteLine(
                    $"  ✓ Extracted {extractedFuncs.Count} functions, {extractedSels.Count} selectors from TeardownScript"
                );
            }
        }

        // Extract from BeforeHook
        if (!string.IsNullOrEmpty(testSuite.Fixture.BeforeHook))
        {
            Console.WriteLine(
                $"[TestCafe Generator] Processing BeforeHook ({testSuite.Fixture.BeforeHook.Length} chars)"
            );
            var (extractedFuncs, extractedSels, remainingCode) =
                ExtractFunctionsAndSelectorsFromSetup(testSuite.Fixture.BeforeHook);
            setupFunctions.AddRange(extractedFuncs);
            foreach (var sel in extractedSels)
            {
                var varName = ExtractVariableName(sel);
                if (!string.IsNullOrEmpty(varName))
                    setupSelectors[varName] = sel; // Deduplicate by variable name
            }
            beforeHookCode = remainingCode;
            Console.WriteLine(
                $"  ✓ Extracted {extractedFuncs.Count} functions, {extractedSels.Count} selectors from BeforeHook"
            );
        }

        // Extract from AfterHook
        if (!string.IsNullOrEmpty(testSuite.Fixture.AfterHook))
        {
            Console.WriteLine(
                $"[TestCafe Generator] Processing AfterHook ({testSuite.Fixture.AfterHook.Length} chars)"
            );
            var (extractedFuncs, extractedSels, remainingCode) =
                ExtractFunctionsAndSelectorsFromSetup(testSuite.Fixture.AfterHook);
            setupFunctions.AddRange(extractedFuncs);
            foreach (var sel in extractedSels)
            {
                var varName = ExtractVariableName(sel);
                if (!string.IsNullOrEmpty(varName))
                    setupSelectors[varName] = sel; // Deduplicate by variable name
            }
            afterHookCode = remainingCode;
            Console.WriteLine(
                $"  ✓ Extracted {extractedFuncs.Count} functions, {extractedSels.Count} selectors from AfterHook"
            );
        }

        // Extract from BeforeEachHook
        if (!string.IsNullOrEmpty(testSuite.Fixture.BeforeEachHook))
        {
            Console.WriteLine(
                $"[TestCafe Generator] Processing BeforeEachHook ({testSuite.Fixture.BeforeEachHook.Length} chars)"
            );
            var (extractedFuncs, extractedSels, remainingCode) =
                ExtractFunctionsAndSelectorsFromSetup(testSuite.Fixture.BeforeEachHook);
            setupFunctions.AddRange(extractedFuncs);
            foreach (var sel in extractedSels)
            {
                var varName = ExtractVariableName(sel);
                if (!string.IsNullOrEmpty(varName))
                    setupSelectors[varName] = sel; // Deduplicate by variable name
            }
            beforeEachHookCode = remainingCode;
            Console.WriteLine(
                $"  ✓ Extracted {extractedFuncs.Count} functions, {extractedSels.Count} selectors from BeforeEachHook"
            );
        }

        // Extract from AfterEachHook
        if (!string.IsNullOrEmpty(testSuite.Fixture.AfterEachHook))
        {
            Console.WriteLine(
                $"[TestCafe Generator] Processing AfterEachHook ({testSuite.Fixture.AfterEachHook.Length} chars)"
            );
            var (extractedFuncs, extractedSels, remainingCode) =
                ExtractFunctionsAndSelectorsFromSetup(testSuite.Fixture.AfterEachHook);
            setupFunctions.AddRange(extractedFuncs);
            foreach (var sel in extractedSels)
            {
                var varName = ExtractVariableName(sel);
                if (!string.IsNullOrEmpty(varName))
                    setupSelectors[varName] = sel; // Deduplicate by variable name
            }
            afterEachHookCode = remainingCode;
            Console.WriteLine(
                $"  ✓ Extracted {extractedFuncs.Count} functions, {extractedSels.Count} selectors from AfterEachHook"
            );
        }

        // Extract from all test case hooks
        var testCaseHookExtractions = new Dictionary<Guid, Dictionary<string, string>>();
        foreach (var testCase in stepTests.Concat(scriptTests))
        {
            var extractions = new Dictionary<string, string>();

            // Extract from BeforeTestHook
            if (!string.IsNullOrEmpty(testCase.BeforeTestHook))
            {
                var (extractedFuncs, extractedSels, remainingCode) =
                    ExtractFunctionsAndSelectorsFromSetup(testCase.BeforeTestHook);
                setupFunctions.AddRange(extractedFuncs);
                foreach (var sel in extractedSels)
                {
                    var varName = ExtractVariableName(sel);
                    if (!string.IsNullOrEmpty(varName))
                        setupSelectors[varName] = sel; // Deduplicate by variable name
                }
                extractions["BeforeTestHook"] = remainingCode ?? string.Empty;
            }

            // Extract from AfterTestHook
            if (!string.IsNullOrEmpty(testCase.AfterTestHook))
            {
                var (extractedFuncs, extractedSels, remainingCode) =
                    ExtractFunctionsAndSelectorsFromSetup(testCase.AfterTestHook);
                setupFunctions.AddRange(extractedFuncs);
                foreach (var sel in extractedSels)
                {
                    var varName = ExtractVariableName(sel);
                    if (!string.IsNullOrEmpty(varName))
                        setupSelectors[varName] = sel; // Deduplicate by variable name
                }
                extractions["AfterTestHook"] = remainingCode ?? string.Empty;
            }

            // Extract from BeforeEachStepHook
            if (!string.IsNullOrEmpty(testCase.BeforeEachStepHook))
            {
                var (extractedFuncs, extractedSels, remainingCode) =
                    ExtractFunctionsAndSelectorsFromSetup(testCase.BeforeEachStepHook);
                setupFunctions.AddRange(extractedFuncs);
                foreach (var sel in extractedSels)
                {
                    var varName = ExtractVariableName(sel);
                    if (!string.IsNullOrEmpty(varName))
                        setupSelectors[varName] = sel; // Deduplicate by variable name
                }
                extractions["BeforeEachStepHook"] = remainingCode ?? string.Empty;
            }

            // Extract from AfterEachStepHook
            if (!string.IsNullOrEmpty(testCase.AfterEachStepHook))
            {
                var (extractedFuncs, extractedSels, remainingCode) =
                    ExtractFunctionsAndSelectorsFromSetup(testCase.AfterEachStepHook);
                setupFunctions.AddRange(extractedFuncs);
                foreach (var sel in extractedSels)
                {
                    var varName = ExtractVariableName(sel);
                    if (!string.IsNullOrEmpty(varName))
                        setupSelectors[varName] = sel; // Deduplicate by variable name
                }
                extractions["AfterEachStepHook"] = remainingCode ?? string.Empty;
            }

            testCaseHookExtractions[testCase.Id] = extractions;
        }

        // Write setup selectors (from all sources) at top level
        if (setupSelectors.Any())
        {
            sb.AppendLine("// Setup Selectors");
            foreach (var selector in setupSelectors.Values)
            {
                sb.AppendLine(selector);
            }
            sb.AppendLine();
        }

        // Write setup functions (from all sources) at top level
        if (setupFunctions.Any())
        {
            sb.AppendLine("// Setup Functions");
            foreach (var func in setupFunctions)
            {
                sb.AppendLine(func);
            }
            sb.AppendLine();
        }

        // Generate fixture declaration from Fixture entity (for all test types)
        // This ensures HTTP auth, hooks, and setup/teardown are always included
        if (scriptTests.Any() || stepTests.Any())
        {
            sb.AppendLine($"fixture('{EscapeString(testSuite.Name)}')");
            
            // Check if PageUrl is a variable reference (no protocol, uppercase/snake_case pattern)
            var pageUrl = testSuite.Fixture.PageUrl;
            var isVariableReference = !string.IsNullOrEmpty(pageUrl) && 
                                     !pageUrl.StartsWith("http://") && 
                                     !pageUrl.StartsWith("https://") &&
                                     !pageUrl.StartsWith("/") &&
                                     (pageUrl.All(c => char.IsUpper(c) || c == '_') || // UPPER_CASE
                                      (char.IsUpper(pageUrl[0]) && pageUrl.Contains("Url"))); // CamelCase with Url
            
            if (isVariableReference)
            {
                // Output as variable reference without quotes
                sb.AppendLine($"    .page({pageUrl})");
            }
            else
            {
                // Output as string literal with quotes
                sb.AppendLine($"    .page('{EscapeString(pageUrl)}')");
            }

            // Add HTTP authentication if configured
            if (
                !string.IsNullOrEmpty(testSuite.Fixture.HttpAuthUsername)
                && !string.IsNullOrEmpty(testSuite.Fixture.HttpAuthPassword)
            )
            {
                sb.AppendLine("    .httpAuth({");
                sb.AppendLine(
                    $"        username: '{EscapeString(testSuite.Fixture.HttpAuthUsername)}',"
                );
                sb.AppendLine(
                    $"        password: '{EscapeString(testSuite.Fixture.HttpAuthPassword)}'"
                );
                sb.AppendLine("    })");
            }

            // Add client scripts if configured
            if (!string.IsNullOrEmpty(testSuite.Fixture.ClientScripts))
            {
                try
                {
                    var clientScripts = JsonSerializer.Deserialize<List<string>>(
                        testSuite.Fixture.ClientScripts
                    );
                    if (clientScripts != null && clientScripts.Any())
                    {
                        foreach (var script in clientScripts)
                        {
                            sb.AppendLine($"    .clientScripts('{EscapeString(script)}')");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(
                        $"[TestCafe Generator] Error parsing client scripts: {ex.Message}"
                    );
                }
            }

            // Add request hooks if configured
            if (!string.IsNullOrEmpty(testSuite.Fixture.RequestHooks))
            {
                try
                {
                    var requestHooks = JsonSerializer.Deserialize<List<string>>(
                        testSuite.Fixture.RequestHooks
                    );
                    if (requestHooks != null && requestHooks.Any())
                    {
                        foreach (var hook in requestHooks)
                        {
                            sb.AppendLine($"    .requestHooks({hook})");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(
                        $"[TestCafe Generator] Error parsing request hooks: {ex.Message}"
                    );
                }
            }

            // Add fixture-level before hook
            if (!string.IsNullOrEmpty(beforeHookCode))
            {
                sb.AppendLine("    .before(async ctx => {");
                sb.AppendLine($"        {IndentCode(beforeHookCode, 8)}");
                sb.AppendLine("    })");
            }

            // Add fixture-level after hook
            if (!string.IsNullOrEmpty(afterHookCode))
            {
                sb.AppendLine("    .after(async ctx => {");
                sb.AppendLine($"        {IndentCode(afterHookCode, 8)}");
                sb.AppendLine("    })");
            }

            // Add beforeEach hook (combines extracted beforeEachHookCode and setupScript)
            var beforeEachCode = new List<string>();
            if (!string.IsNullOrEmpty(beforeEachHookCode))
            {
                beforeEachCode.Add(beforeEachHookCode);
            }
            if (!string.IsNullOrWhiteSpace(setupScript))
            {
                beforeEachCode.Add(setupScript);
            }

            if (beforeEachCode.Any())
            {
                sb.AppendLine("    .beforeEach(async () => {");
                foreach (var code in beforeEachCode)
                {
                    sb.AppendLine($"        {IndentCode(code, 8)}");
                }
                sb.AppendLine("    })");
            }

            // Add afterEach hook (combines extracted afterEachHookCode and teardownScript)
            var afterEachCode = new List<string>();
            if (!string.IsNullOrEmpty(afterEachHookCode))
            {
                afterEachCode.Add(afterEachHookCode);
            }
            if (!string.IsNullOrEmpty(extractedTeardownScript))
            {
                afterEachCode.Add(extractedTeardownScript);
            }

            if (afterEachCode.Any())
            {
                sb.AppendLine("    .afterEach(async t => {");
                foreach (var code in afterEachCode)
                {
                    sb.AppendLine($"        {IndentCode(code, 8)}");
                }
                sb.AppendLine("    })");
            }

            // Add metadata if configured
            if (!string.IsNullOrEmpty(testSuite.Fixture.Metadata))
            {
                try
                {
                    var metadata = JsonSerializer.Deserialize<Dictionary<string, object>>(
                        testSuite.Fixture.Metadata
                    );
                    if (metadata != null && metadata.Any())
                    {
                        sb.AppendLine("    .meta({");
                        var metaItems = metadata.Select(kvp =>
                            $"        {kvp.Key}: {JsonSerializer.Serialize(kvp.Value)}"
                        );
                        sb.AppendLine(string.Join(",\n", metaItems));
                        sb.AppendLine("    })");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(
                        $"[TestCafe Generator] Error parsing fixture metadata: {ex.Message}"
                    );
                }
            }

            sb.AppendLine(";");
            sb.AppendLine();
        }

        // Generate steps-based test cases
        foreach (var testCase in stepTests)
        {
            // Start test declaration
            var testDeclaration = $"test";

            // Add .skip() if configured
            if (testCase.Skip)
            {
                testDeclaration += ".skip";
            }

            // Add .only() if configured
            if (testCase.Only)
            {
                testDeclaration += ".only";
            }

            sb.Append($"{testDeclaration}('{EscapeString(testCase.Name)}'");

            // Add test metadata if configured
            if (testCase.Meta != null)
            {
                try
                {
                    var metaJson = testCase.Meta.RootElement.GetRawText();
                    sb.Append($", {metaJson}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine(
                        $"[TestCafe Generator] Error parsing test metadata: {ex.Message}"
                    );
                }
            }

            sb.AppendLine(", async t => {");
            // Inject TEST_CASE_ID for result mapping
            sb.AppendLine($"    // TEST_CASE_ID: {testCase.Id}");

            // Add test-level page navigation if configured
            if (!string.IsNullOrEmpty(testCase.PageUrl))
            {
                sb.AppendLine($"    // Navigate to test-specific page");
                sb.AppendLine($"    await t.navigateTo('{EscapeString(testCase.PageUrl)}');");
                sb.AppendLine();
            }

            // Add test-level client scripts if configured
            if (testCase.ClientScripts != null)
            {
                try
                {
                    var clientScriptsJson = testCase.ClientScripts.RootElement.GetRawText();
                    var clientScripts = JsonSerializer.Deserialize<List<string>>(clientScriptsJson);
                    if (clientScripts != null && clientScripts.Any())
                    {
                        sb.AppendLine($"    // Inject test-specific client scripts");
                        foreach (var script in clientScripts)
                        {
                            sb.AppendLine($"    await t.eval(() => {{ {EscapeString(script)} }});");
                        }
                        sb.AppendLine();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(
                        $"[TestCafe Generator] Error parsing test client scripts: {ex.Message}"
                    );
                }
            }

            // Add before test hook
            if (
                testCaseHookExtractions.TryGetValue(testCase.Id, out var extractions)
                && extractions.TryGetValue("BeforeTestHook", out var beforeTestCode)
                && !string.IsNullOrEmpty(beforeTestCode)
            )
            {
                sb.AppendLine($"    // Before test hook");
                sb.AppendLine($"    {IndentCode(beforeTestCode, 4)}");
                sb.AppendLine();
            }

            if (testCase.TestType == TestType.Steps && testCase.Steps != null)
            {
                // Generate steps-based test
                try
                {
                    var stepsJson = testCase.Steps.RootElement.GetRawText();
                    Console.WriteLine(
                        $"[TestCafe Generator] Raw Steps JSON for test '{testCase.Name}': {stepsJson}"
                    );

                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var steps = JsonSerializer.Deserialize<List<TestStep>>(stepsJson, options);

                    Console.WriteLine(
                        $"[TestCafe Generator] Deserialized {steps?.Count ?? 0} steps"
                    );

                    if (steps != null && steps.Count > 0)
                    {
                        for (int i = 0; i < steps.Count; i++)
                        {
                            var step = steps[i];
                            Console.WriteLine(
                                $"[TestCafe Generator] Step - Action: '{step.Action}', Selector: '{step.Selector}', Value: '{step.Value}'"
                            );

                            // Add before each step hook
                            if (
                                testCaseHookExtractions.TryGetValue(
                                    testCase.Id,
                                    out var stepExtractions
                                )
                                && stepExtractions.TryGetValue(
                                    "BeforeEachStepHook",
                                    out var beforeEachStepCode
                                )
                                && !string.IsNullOrEmpty(beforeEachStepCode)
                            )
                            {
                                sb.AppendLine($"    // Before step {i + 1} hook");
                                sb.AppendLine($"    {IndentCode(beforeEachStepCode, 4)}");
                            }

                            sb.AppendLine(
                                $"    // Step {i + 1}: {EscapeString(step.Description ?? "")}"
                            );
                            sb.AppendLine($"    {GenerateStepCode(step)}");

                            // Add after each step hook
                            if (
                                testCaseHookExtractions.TryGetValue(
                                    testCase.Id,
                                    out var stepExtractionsAfter
                                )
                                && stepExtractionsAfter.TryGetValue(
                                    "AfterEachStepHook",
                                    out var afterEachStepCode
                                )
                                && !string.IsNullOrEmpty(afterEachStepCode)
                            )
                            {
                                sb.AppendLine($"    // After step {i + 1} hook");
                                sb.AppendLine($"    {IndentCode(afterEachStepCode, 4)}");
                            }

                            if (i < steps.Count - 1)
                            {
                                sb.AppendLine();
                            }
                        }
                    }
                    else
                    {
                        sb.AppendLine("    // No steps found or deserialization failed");
                        Console.WriteLine(
                            $"[TestCafe Generator] WARNING: No steps found for test '{testCase.Name}'"
                        );
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(
                        $"[TestCafe Generator] ERROR deserializing steps: {ex.Message}"
                    );
                    sb.AppendLine($"    // Error deserializing steps: {ex.Message}");
                }
            }
            // Script-based tests are handled separately to allow custom imports/fixtures

            // Add after test hook
            if (
                testCaseHookExtractions.TryGetValue(testCase.Id, out var afterExtractions)
                && afterExtractions.TryGetValue("AfterTestHook", out var afterTestCode)
                && !string.IsNullOrEmpty(afterTestCode)
            )
            {
                sb.AppendLine();
                sb.AppendLine($"    // After test hook");
                sb.AppendLine($"    {IndentCode(afterTestCode, 4)}");
            }

            sb.AppendLine("});");
            sb.AppendLine();
        }

        // Write extracted selectors (deduplicated, after fixture but before tests)
        if (extractedSelectors.Any())
        {
            sb.AppendLine("// Shared Selectors");
            foreach (var selector in extractedSelectors.Values.OrderBy(s => s))
            {
                sb.Append(selector);
                if (!selector.EndsWith("\n"))
                {
                    sb.AppendLine();
                }
            }
            sb.AppendLine();
            Console.WriteLine($"  ✓ Deduplicated {extractedSelectors.Count} selectors");
        }

        // Write extracted functions
        if (extractedFunctions.Any())
        {
            sb.AppendLine("// Shared Functions");
            foreach (var func in extractedFunctions)
            {
                sb.Append(func);
                if (!func.EndsWith("\n"))
                {
                    sb.AppendLine();
                }
            }
            sb.AppendLine();
        }

        // Write script-based test blocks (fixture declarations are stripped during extraction)
        if (cleanedTestBlocks.Any())
        {
            if (stepTests.Any())
            {
                sb.AppendLine("// Script-based tests");
            }
            foreach (var block in cleanedTestBlocks)
            {
                sb.AppendLine(block);
                sb.AppendLine();
            }
        }

        var testContent = sb.ToString();

        // Ensure all required TestCafe imports are present based on actual usage
        testContent = EnsureTestCafeImports(testContent);

        // Validate generated content for errors
        var validationErrors = ValidateGeneratedContent(testContent);

        // Generate file path following the structure: {functional-area}/{fixture-name}/{suite-name}_{timestamp}.test.js
        // Note: Don't include "temp-tests" here as TestRunner already uses that as its base directory
        var functionalAreaSlug = ToSlug(testSuite.Fixture.FunctionalRequirement?.Name ?? "default");
        var fixtureSlug = "fixture-" + ToSlug(testSuite.Fixture.Name);
        var suiteSlug = ToSlug(testSuite.Name);
        var timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
        var fileName = $"{suiteSlug}_{timestamp}.test.js";

        // Build path relative to TestRunner/temp-tests directory
        var relativePath = Path.Combine(functionalAreaSlug, fixtureSlug, fileName);

        // Determine temp directory based on environment
        // Production: Use /var/tmp/testrunner-tests (same as Node TestRunner service)
        // Development: Use relative path ../TestRunner/temp-tests
        string testRunnerDir;
        var tempTestsDir = Environment.GetEnvironmentVariable("TEMP_TESTS_DIR");

        if (!string.IsNullOrEmpty(tempTestsDir))
        {
            // Production: Use environment variable (e.g., /var/tmp/testrunner-tests)
            testRunnerDir = tempTestsDir;
            Console.WriteLine(
                $"[TestCafe Generator] Using TEMP_TESTS_DIR from environment: {testRunnerDir}"
            );
        }
        else
        {
            // Development: Use relative path from current directory
            var currentDir = Directory.GetCurrentDirectory();
            testRunnerDir = Path.Combine(currentDir, "..", "TestRunner", "temp-tests");
            Console.WriteLine($"[TestCafe Generator] Using relative path for dev: {testRunnerDir}");
        }

        var absolutePath = Path.Combine(testRunnerDir, relativePath);

        // Normalize the path to resolve .. references
        absolutePath = Path.GetFullPath(absolutePath);

        // Create directory if it doesn't exist
        var directory = Path.GetDirectoryName(absolutePath);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
            Console.WriteLine(
                $"  ✓ Created directory: {Path.Combine(functionalAreaSlug, fixtureSlug)}"
            );
        }

        // Update fixture remark if validation errors found
        if (validationErrors.Any())
        {
            var errorMessage = string.Join(" | ", validationErrors);
            testSuite.Fixture.Remark = $"Generated: {DateTime.UtcNow:O} - {errorMessage}";
            _db.TestFixtures.Update(testSuite.Fixture);
            await _db.SaveChangesAsync();
            Console.WriteLine($"  ⚠️ Validation errors found: {errorMessage}");
        }
        else if (!string.IsNullOrEmpty(testSuite.Fixture.Remark))
        {
            // Clear remark if previously had errors and now fixed
            testSuite.Fixture.Remark = null;
            _db.TestFixtures.Update(testSuite.Fixture);
            await _db.SaveChangesAsync();
            Console.WriteLine($"  ✓ Previous errors cleared from fixture remark");
        }

        // Write the file
        await File.WriteAllTextAsync(absolutePath, testContent);
        Console.WriteLine(
            $"  ✓ Generated: {fileName} ({scriptTests.Count + stepTests.Count} test cases)"
        );

        return (relativePath, testContent);
    }

    private string GenerateStepCode(TestStep step)
    {
        var code = new StringBuilder();

        var action = step.Action?.ToLower() ?? "";

        switch (action)
        {
            case "click":
                if (!string.IsNullOrEmpty(step.Selector))
                    code.Append($"await t.click(Selector('{EscapeString(step.Selector)}'));");
                else
                    code.Append("// Click action requires a selector");
                break;

            case "type":
                if (!string.IsNullOrEmpty(step.Selector) && !string.IsNullOrEmpty(step.Value))
                    code.Append(
                        $"await t.typeText(Selector('{EscapeString(step.Selector)}'), '{EscapeString(step.Value)}', {{ replace: true }});"
                    );
                else
                    code.Append("// Type action requires both selector and value");
                break;

            case "navigate":
                if (!string.IsNullOrEmpty(step.Value))
                    code.Append($"await t.navigateTo('{EscapeString(step.Value)}');");
                else
                    code.Append("// Navigate action requires a URL");
                break;

            case "wait":
                var waitTime = step.Value ?? "1000";
                code.Append($"await t.wait({waitTime});");
                break;

            case "hover":
                if (!string.IsNullOrEmpty(step.Selector))
                    code.Append($"await t.hover(Selector('{EscapeString(step.Selector)}'));");
                else
                    code.Append("// Hover action requires a selector");
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
                else
                    code.Append("// Select action requires both selector and value");
                break;

            case "presskey":
                if (!string.IsNullOrEmpty(step.Value))
                    code.Append($"await t.pressKey('{EscapeString(step.Value)}');");
                else
                    code.Append("// PressKey action requires a key name");
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

    private string EscapeString(string? input)
    {
        if (string.IsNullOrEmpty(input))
            return "";
        return input.Replace("'", "\\'").Replace("\n", "\\n").Replace("\r", "");
    }

    private string IndentCode(string code, int spaces)
    {
        var indent = new string(' ', spaces);
        return string.Join("\n" + indent, code.Split('\n'));
    }

    private (List<string> imports, string body) ExtractImportsAndBody(string script)
    {
        // Normalize any JSON-escaped content first so line parsing works
        var normalizedScript = UnescapeCommonEscapes(script);

        var imports = new List<string>();
        var bodyLines = new List<string>();
        using var reader = new StringReader(normalizedScript);
        string? line;
        while ((line = reader.ReadLine()) != null)
        {
            var trimmed = line.TrimStart();
            if (trimmed.StartsWith("import "))
            {
                // Filter out 't' from TestCafe imports before adding to the list
                var normalizedImport = line.Trim();
                if (normalizedImport.Contains("from 'testcafe'"))
                {
                    normalizedImport = FilterTestCafeImports(normalizedImport);
                }

                // Only add non-empty import statements
                if (!string.IsNullOrWhiteSpace(normalizedImport))
                {
                    imports.Add(normalizedImport);
                }
            }
            else
            {
                bodyLines.Add(line);
            }
        }
        return (imports.Distinct().ToList(), string.Join("\n", bodyLines));
    }

    private string UnescapeCommonEscapes(string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        // Replace common JSON-style escapes with actual characters
        var s = input.Replace("\\r\\n", "\n").Replace("\\n", "\n").Replace("\\t", "\t");

        // Unescape common quotes/backticks if users pasted JSON-escaped content
        s = s.Replace("\\\"", "\"").Replace("\\'", "'").Replace("\\`", "`");

        return s;
    }

    private static string RemoveTypeScriptAnnotations(string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        // String/comment-aware, conservative TS stripper:
        // - Removes parameter type annotations inside function(...) and (...)=> signatures
        // - Removes return type annotations: ) : Type {  and  ) : Type =>
        // - Removes "as Type" assertions (not inside strings/comments)
        //
        // It does NOT attempt to parse full TS. It only handles safe, common patterns.

        var s = input;

        // 1) Strip function(...) parameter annotations
        s = StripFunctionParamTypes(s);

        // 2) Strip arrow function (...)=> parameter annotations
        s = StripArrowParamTypes(s);

        // 3) Strip return type annotations after ')'
        s = StripReturnTypes(s);

        // 4) Strip "as Type" assertions
        s = StripAsAssertions(s);

        return s;
    }

    private static string StripFunctionParamTypes(string s)
    {
        var sb = new StringBuilder(s.Length);
        int i = 0;

        while (i < s.Length)
        {
            if (IsAtKeyword(s, i, "function") && IsWordBoundary(s, i - 1) && IsWordBoundary(s, i + 8))
            {
                // Copy "function"
                sb.Append("function");
                i += 8;

                // Copy until we reach the next '(' (skipping strings/comments safely)
                int parenIndex = FindNextCharOutsideStringsAndComments(s, i, '(');
                if (parenIndex < 0)
                {
                    sb.Append(s.AsSpan(i));
                    break;
                }

                sb.Append(s.AsSpan(i, parenIndex - i)); // copy up to '('
                int closeIndex = FindMatchingParenOutsideStringsAndComments(s, parenIndex);
                if (closeIndex < 0)
                {
                    // unmatched - copy rest
                    sb.Append(s.AsSpan(parenIndex));
                    break;
                }

                sb.Append('(');
                var paramList = s.Substring(parenIndex + 1, closeIndex - parenIndex - 1);
                sb.Append(StripParamListTypes(paramList));
                sb.Append(')');

                i = closeIndex + 1;
                continue;
            }

            // normal char
            sb.Append(s[i]);
            i++;
        }

        return sb.ToString();
    }

    private static string StripArrowParamTypes(string s)
    {
        // Finds occurrences of "( ... ) =>" outside strings/comments and strips types inside the parens.
        var sb = new StringBuilder(s.Length);
        int i = 0;

        while (i < s.Length)
        {
            if (s[i] == '(' && !IsInsideStringOrComment(s, i))
            {
                int closeIndex = FindMatchingParenOutsideStringsAndComments(s, i);
                if (closeIndex > i)
                {
                    int j = SkipWhitespace(s, closeIndex + 1);
                    if (j + 1 < s.Length && s[j] == '=' && s[j + 1] == '>')
                    {
                        // It's an arrow params group
                        sb.Append('(');
                        var paramList = s.Substring(i + 1, closeIndex - i - 1);
                        sb.Append(StripParamListTypes(paramList));
                        sb.Append(')');
                        // copy " =>" (with original whitespace)
                        sb.Append(s.AsSpan(closeIndex + 1, j - (closeIndex + 1)));
                        sb.Append("=>");
                        i = j + 2;
                        continue;
                    }
                }
            }

            sb.Append(s[i]);
            i++;
        }

        return sb.ToString();
    }

    private static string StripReturnTypes(string s)
    {
        // Rewrites: ") : Type {" -> ") {"
        // and:      ") : Type =>" -> ") =>"
        // Only outside strings/comments.
        var sb = new StringBuilder(s.Length);
        int i = 0;

        while (i < s.Length)
        {
            if (s[i] == ')' && !IsInsideStringOrComment(s, i))
            {
                sb.Append(')');
                int j = SkipWhitespace(s, i + 1);

                if (j < s.Length && s[j] == ':')
                {
                    int k = SkipWhitespace(s, j + 1);

                    // Parse a type token sequence (very conservative) until we hit '{' or '=>'
                    int typeEnd = FindTypeAnnotationEnd(s, k);
                    if (typeEnd > k)
                    {
                        int afterType = SkipWhitespace(s, typeEnd);

                        // If next is '{' -> drop the ": Type"
                        if (afterType < s.Length && s[afterType] == '{')
                        {
                            sb.Append(' ');
                            sb.Append('{');
                            i = afterType + 1;
                            continue;
                        }

                        // If next is "=>"
                        if (afterType + 1 < s.Length && s[afterType] == '=' && s[afterType + 1] == '>')
                        {
                            sb.Append(' ');
                            sb.Append("=>");
                            i = afterType + 2;
                            continue;
                        }
                    }
                }

                i++;
                continue;
            }

            sb.Append(s[i]);
            i++;
        }

        return sb.ToString();
    }

    private static string StripAsAssertions(string s)
    {
        // Remove " as Type" outside strings/comments, conservatively.
        var sb = new StringBuilder(s.Length);
        int i = 0;

        while (i < s.Length)
        {
            if (!IsInsideStringOrComment(s, i) && IsAtKeyword(s, i, "as") && IsWordBoundary(s, i - 1) && IsWordBoundary(s, i + 2))
            {
                // Ensure there's whitespace before "as" in output already (common pattern " x as T")
                // We remove from current position up to the end of the type.
                int prev = i - 1;
                if (prev >= 0 && char.IsWhiteSpace(s[prev]))
                {
                    int k = SkipWhitespace(s, i + 2);
                    int typeEnd = FindTypeAnnotationEnd(s, k);
                    if (typeEnd > k)
                    {
                        // Drop " as Type"
                        i = typeEnd;
                        continue;
                    }
                }
            }

            sb.Append(s[i]);
            i++;
        }

        return sb.ToString();
    }

    private static string StripParamListTypes(string paramList)
    {
        // Only remove "name: Type" when Type looks like a TS type (not a value like true/false/"x"/123/{...})
        // Also handles optional params "name?: Type" and rest "...args: Type[]"
        var sb = new StringBuilder(paramList.Length);
        int i = 0;

        while (i < paramList.Length)
        {
            // Copy strings/comments verbatim inside the param list
            if (TryCopyStringOrComment(paramList, ref i, sb))
                continue;

            // Handle rest operator
            if (i + 2 < paramList.Length && paramList[i] == '.' && paramList[i + 1] == '.' && paramList[i + 2] == '.')
            {
                sb.Append("...");
                i += 3;
                continue;
            }

            // Identifier start?
            if (IsIdentStart(paramList[i]))
            {
                int start = i;
                i++;
                while (i < paramList.Length && IsIdentPart(paramList[i])) i++;

                // Optional param marker '?'
                int opt = i;
                if (opt < paramList.Length && paramList[opt] == '?')
                {
                    i++;
                }

                int ws = SkipWhitespace(paramList, i);
                if (ws < paramList.Length && paramList[ws] == ':')
                {
                    int afterColon = SkipWhitespace(paramList, ws + 1);

                    // Only strip if it looks like a TYPE start (not a value start)
                    if (LooksLikeTypeStart(paramList, afterColon))
                    {
                        // Emit identifier (and optional '?') but skip ": Type"
                        sb.Append(paramList.AsSpan(start, i - start)); // includes '?' if present
                        // Skip ":"
                        int typeEnd = FindTypeAnnotationEnd(paramList, afterColon);
                        if (typeEnd <= afterColon)
                        {
                            // Failed to parse type safely, fall back to original
                            sb.Append(paramList.AsSpan(i, 0));
                        }
                        // Continue from typeEnd (do not swallow default value "= ...")
                        i = typeEnd;
                        continue;
                    }
                }

                // Not a type annotation -> emit original identifier chunk and continue
                sb.Append(paramList.AsSpan(start, i - start));
                continue;
            }

            sb.Append(paramList[i]);
            i++;
        }

        return sb.ToString();
    }

    // ---------------- helpers ----------------

    private static bool LooksLikeTypeStart(string s, int i)
    {
        if (i >= s.Length) return false;

        char c = s[i];

        // Value starts we must NOT treat as type
        if (c == '"' || c == '\'' || c == '`') return false;
        if (c == '{' || c == '[' || c == '(') return false;
        if (char.IsDigit(c)) return false;

        // Keywords that are likely values in defaults
        if (IsAtKeyword(s, i, "true") || IsAtKeyword(s, i, "false") || IsAtKeyword(s, i, "null") || IsAtKeyword(s, i, "undefined"))
            return false;

        // Common TS primitive types (lowercase)
        if (IsAtKeyword(s, i, "string") || IsAtKeyword(s, i, "number") || IsAtKeyword(s, i, "boolean")
            || IsAtKeyword(s, i, "any") || IsAtKeyword(s, i, "unknown") || IsAtKeyword(s, i, "void")
            || IsAtKeyword(s, i, "never") || IsAtKeyword(s, i, "object"))
            return true;

        // Uppercase types / generics / namespaces often start with letter/_/$
        return IsIdentStart(c);
    }

    private static int FindTypeAnnotationEnd(string s, int i)
    {
        // Consume a conservative TS type expression:
        // Identifiers, dots, generics <>, unions |, intersections &, arrays [], spaces.
        // Stop before '=', ',', ')', '}', ']', ';', or newline.
        int depthAngle = 0;
        int depthBrack = 0;

        int start = i;
        while (i < s.Length)
        {
            if (TrySkipStringOrComment(s, ref i))
                continue;

            char c = s[i];

            if (c == '<') { depthAngle++; i++; continue; }
            if (c == '>' && depthAngle > 0) { depthAngle--; i++; continue; }
            if (c == '[') { depthBrack++; i++; continue; }
            if (c == ']' && depthBrack > 0) { depthBrack--; i++; continue; }

            if (depthAngle == 0 && depthBrack == 0)
            {
                if (c == '=' || c == ',' || c == ')' || c == '}' || c == ';')
                    break;
                // For arrow return parsing we also stop before "=>", handled by caller after whitespace.
            }

            // Allow typical type tokens
            if (char.IsWhiteSpace(c) || IsIdentPart(c) || c == '.' || c == '|' || c == '&' || c == '?' || c == ':')
            {
                i++;
                continue;
            }

            // Anything else: stop (too risky)
            break;
        }

        // Must have consumed something meaningful
        return i > start ? i : start;
    }

    private static int FindNextCharOutsideStringsAndComments(string s, int start, char target)
    {
        int i = start;
        while (i < s.Length)
        {
            if (TrySkipStringOrComment(s, ref i))
                continue;

            if (s[i] == target)
                return i;

            i++;
        }
        return -1;
    }

    private static int FindMatchingParenOutsideStringsAndComments(string s, int openParenIndex)
    {
        int depth = 0;
        for (int i = openParenIndex; i < s.Length; i++)
        {
            if (TrySkipStringOrComment(s, ref i))
                continue;

            if (s[i] == '(') depth++;
            else if (s[i] == ')')
            {
                depth--;
                if (depth == 0) return i;
            }
        }
        return -1;
    }

    private static int SkipWhitespace(string s, int i)
    {
        while (i < s.Length && char.IsWhiteSpace(s[i])) i++;
        return i;
    }

    private static bool IsInsideStringOrComment(string s, int index)
    {
        // Lightweight check by scanning from start to index.
        // Used only in a few spots; acceptable for generated test sizes.
        bool inSingle = false, inDouble = false, inTemplate = false, inLine = false, inBlock = false;
        for (int i = 0; i < index && i < s.Length; i++)
        {
            char c = s[i];
            char n = i + 1 < s.Length ? s[i + 1] : '\0';

            if (inLine)
            {
                if (c == '\n') inLine = false;
                continue;
            }
            if (inBlock)
            {
                if (c == '*' && n == '/') { inBlock = false; i++; }
                continue;
            }
            if (inSingle)
            {
                if (c == '\\') { i++; continue; }
                if (c == '\'') inSingle = false;
                continue;
            }
            if (inDouble)
            {
                if (c == '\\') { i++; continue; }
                if (c == '"') inDouble = false;
                continue;
            }
            if (inTemplate)
            {
                if (c == '\\') { i++; continue; }
                if (c == '`') inTemplate = false;
                continue;
            }

            if (c == '/' && n == '/') { inLine = true; i++; continue; }
            if (c == '/' && n == '*') { inBlock = true; i++; continue; }
            if (c == '\'') { inSingle = true; continue; }
            if (c == '"') { inDouble = true; continue; }
            if (c == '`') { inTemplate = true; continue; }
        }

        return inSingle || inDouble || inTemplate || inLine || inBlock;
    }

    private static bool TrySkipStringOrComment(string s, ref int i)
    {
        if (i >= s.Length) return false;
        char c = s[i];
        char n = i + 1 < s.Length ? s[i + 1] : '\0';

        // line comment
        if (c == '/' && n == '/')
        {
            i += 2;
            while (i < s.Length && s[i] != '\n') i++;
            return true;
        }
        // block comment
        if (c == '/' && n == '*')
        {
            i += 2;
            while (i + 1 < s.Length && !(s[i] == '*' && s[i + 1] == '/')) i++;
            if (i + 1 < s.Length) i += 2;
            return true;
        }
        // single quote
        if (c == '\'')
        {
            i++;
            while (i < s.Length)
            {
                if (s[i] == '\\') { i += 2; continue; }
                if (s[i] == '\'') { i++; break; }
                i++;
            }
            return true;
        }
        // double quote
        if (c == '"')
        {
            i++;
            while (i < s.Length)
            {
                if (s[i] == '\\') { i += 2; continue; }
                if (s[i] == '"') { i++; break; }
                i++;
            }
            return true;
        }
        // template
        if (c == '`')
        {
            i++;
            while (i < s.Length)
            {
                if (s[i] == '\\') { i += 2; continue; }
                if (s[i] == '`') { i++; break; }
                i++;
            }
            return true;
        }

        return false;
    }

    private static bool TryCopyStringOrComment(string s, ref int i, StringBuilder sb)
    {
        int start = i;
        if (TrySkipStringOrComment(s, ref i))
        {
            sb.Append(s.AsSpan(start, i - start));
            return true;
        }
        return false;
    }

    private static bool IsAtKeyword(string s, int i, string kw)
    {
        if (i < 0 || i + kw.Length > s.Length) return false;
        for (int k = 0; k < kw.Length; k++)
        {
            if (s[i + k] != kw[k]) return false;
        }
        return true;
    }

    private static bool IsWordBoundary(string s, int i)
    {
        if (i < 0 || i >= s.Length) return true;
        return !IsIdentPart(s[i]);
    }

    private static bool IsIdentStart(char c) => char.IsLetter(c) || c == '_' || c == '$';
    private static bool IsIdentPart(char c) => char.IsLetterOrDigit(c) || c == '_' || c == '$';

    private static List<string> MergeImports(
        List<string> existingImports,
        List<string> requiredImports
    )
    {
        var importMap = new Dictionary<string, HashSet<string>>();

        // Parse existing imports
        foreach (var import in existingImports)
        {
            var (module, imports) = ParseImportStatement(import);
            if (!string.IsNullOrEmpty(module))
            {
                if (!importMap.ContainsKey(module))
                    importMap[module] = new HashSet<string>();
                foreach (var imp in imports)
                {
                    // In TestCafe, `t` is provided as the test context argument and must not be imported
                    if (module == "testcafe" && string.Equals(imp, "t", StringComparison.Ordinal))
                        continue;

                    importMap[module].Add(imp); // Deduplicate by variable name
                }
            }
        }

        // Add required imports to testcafe module
        if (requiredImports.Any())
        {
            if (!importMap.ContainsKey("testcafe"))
                importMap["testcafe"] = new HashSet<string>();
            foreach (var req in requiredImports)
            {
                // In TestCafe, `t` is provided as the test context argument and must not be imported
                if (string.Equals(req, "t", StringComparison.Ordinal))
                    continue;

                importMap["testcafe"].Add(req);
            }
        }

        // Generate final import statements
        var result = new List<string>();
        foreach (var kvp in importMap.OrderBy(x => x.Key))
        {
            if (kvp.Value.Count == 0)
                continue;

            var imports = string.Join(", ", kvp.Value.OrderBy(x => x));
            result.Add($"import {{ {imports} }} from '{kvp.Key}';");
        }

        return result;
    }

    private string ExtractVariableName(string selectorLine)
    {
        // Extract variable name from: const dashboard = Selector(...);\
        var match = System.Text.RegularExpressions.Regex.Match(selectorLine, @"const\s+(\w+)\s*=");
        return match.Success ? match.Groups[1].Value : string.Empty;
    }

    private (
        List<string> functions,
        List<string> selectors,
        string remainingCode
    ) ExtractFunctionsAndSelectorsFromSetup(string setupScript)
    {
        var functions = new List<string>();
        var selectors = new List<string>();
        var remainingLines = new List<string>();

        // Normalize escaped content (in case it's stored as JSON string)
        var normalized = UnescapeCommonEscapes(setupScript);
        var lines = normalized.Split('\n');

        Console.WriteLine($"[ExtractFunctionsAndSelectors] Processing {lines.Length} lines");

        var inFunction = false;
        var functionLines = new List<string>();
        var braceCount = 0;

        for (int i = 0; i < lines.Length; i++)
        {
            var line = lines[i];
            var trimmed = line.Trim();

            // Detect function declaration (with or without export)
            if (
                !inFunction
                && (
                    trimmed.StartsWith("export async function")
                    || trimmed.StartsWith("async function")
                    || trimmed.StartsWith("function")
                )
            )
            {
                Console.WriteLine(
                    $"[ExtractFunctionsAndSelectors] Found function at line {i}: {trimmed.Substring(0, Math.Min(50, trimmed.Length))}..."
                );
                inFunction = true;
                braceCount = 0;
                functionLines.Clear();
                // Remove 'export ' keyword if present
                var cleanedLine = trimmed.StartsWith("export ") ? trimmed.Substring(7) : trimmed;
                functionLines.Add(cleanedLine);
                braceCount += line.Count(c => c == '{');
                braceCount -= line.Count(c => c == '}');
                Console.WriteLine(
                    $"[ExtractFunctionsAndSelectors] Initial brace count: {braceCount}"
                );
                continue;
            }

            if (inFunction)
            {
                functionLines.Add(line.TrimStart());
                braceCount += line.Count(c => c == '{');
                braceCount -= line.Count(c => c == '}');

                if (braceCount == 0)
                {
                    // Function complete - extract selectors from within it
                    var funcSelectors = new List<string>();
                    var funcBodyLines = new List<string>();

                    foreach (var funcLine in functionLines)
                    {
                        var funcTrimmed = funcLine.Trim();
                        if (funcTrimmed.StartsWith("const ") && funcTrimmed.Contains("Selector("))
                        {
                            // Extract selector to top-level
                            funcSelectors.Add(funcTrimmed);
                        }
                        else
                        {
                            funcBodyLines.Add(funcLine);
                        }
                    }

                    // Add extracted selectors to the list
                    selectors.AddRange(funcSelectors);

                    // Rebuild function without internal selectors
                    functions.Add(string.Join("\n", funcBodyLines));

                    inFunction = false;
                    functionLines.Clear();
                }
                continue;
            }

            // Not in a function - check if it's a top-level selector or other code
            if (trimmed.StartsWith("const ") && trimmed.Contains("Selector("))
            {
                selectors.Add(trimmed);
            }
            else if (!string.IsNullOrWhiteSpace(trimmed) && !trimmed.StartsWith("//"))
            {
                // Keep other code (like function calls) for beforeEach
                remainingLines.Add(trimmed);
            }
        }

        var remainingCode = remainingLines.Any() ? string.Join("\n", remainingLines) : null;

        Console.WriteLine($"[ExtractFunctionsAndSelectors] Extraction complete:");
        Console.WriteLine($"  - Functions extracted: {functions.Count}");
        Console.WriteLine($"  - Selectors extracted: {selectors.Count}");
        Console.WriteLine($"  - Remaining code lines: {remainingLines.Count}");
        if (functions.Count > 0)
        {
            Console.WriteLine(
                $"  - First function preview: {functions[0].Substring(0, Math.Min(100, functions[0].Length))}..."
            );
        }

        return (functions, selectors, remainingCode);
    }

    private List<string> ValidateGeneratedContent(string content)
    {
        var errors = new List<string>();
        var lines = content.Split('\n');
        var globalSelectorVariables = new HashSet<string>();
        var duplicateSelectors = new List<string>();
        var lineNumber = 0;
        var braceDepth = 0;
        var functionDepthStack = new Stack<int>(); // Track all function depths (tests, hooks, and helper functions)
        var selectorScopeStack = new Stack<HashSet<string>>(); // Track selector names per function scope

        foreach (var line in lines)
        {
            lineNumber++;
            var trimmed = line.Trim();

            // Check for ANY function declaration BEFORE updating brace depth
            // Track function starts (tests, hooks, helper functions, and Role declarations)
            if (
                trimmed.StartsWith("test(")
                || trimmed.StartsWith("test.skip(")
                || trimmed.StartsWith("test.only(")
                || trimmed.Contains(".beforeEach(")
                || trimmed.Contains(".afterEach(")
                || trimmed.Contains(".before(")
                || trimmed.Contains(".after(")
                || trimmed.StartsWith("async function ")
                || trimmed.StartsWith("function ")
                || (
                    trimmed.StartsWith("const ")
                    && trimmed.Contains("async ")
                    && trimmed.Contains("=>")
                )
                || (trimmed.StartsWith("const ") && trimmed.Contains("function("))
                || (trimmed.StartsWith("const ") && trimmed.Contains("=>"))
                || (
                    trimmed.StartsWith("let ")
                    && trimmed.Contains("async ")
                    && trimmed.Contains("=>")
                )
                || (
                    trimmed.StartsWith("var ")
                    && trimmed.Contains("async ")
                    && trimmed.Contains("=>")
                )
                || trimmed.Contains("Role(") // TestCafe Role declarations contain async functions
            )
            {
                functionDepthStack.Push(braceDepth);
                selectorScopeStack.Push(new HashSet<string>());
            }

            // Track brace depth to know when we're inside functions
            braceDepth += trimmed.Count(c => c == '{');
            braceDepth -= trimmed.Count(c => c == '}');

            // Pop function depths when we exit functions
            while (functionDepthStack.Count > 0 && braceDepth <= functionDepthStack.Peek())
            {
                functionDepthStack.Pop();
                selectorScopeStack.Pop();
            }

            // Check for Selector() declarations - track multi-line selectors
            if (trimmed.StartsWith("const ") && trimmed.Contains("Selector("))
            {
                var varName = ExtractVariableName(trimmed);
                if (!string.IsNullOrEmpty(varName))
                {
                    var currentScopeSelectors =
                        selectorScopeStack.Count > 0
                            ? selectorScopeStack.Peek()
                            : globalSelectorVariables;

                    if (currentScopeSelectors.Contains(varName))
                    {
                        duplicateSelectors.Add(varName);
                    }
                    else
                    {
                        currentScopeSelectors.Add(varName);
                    }
                }

                // For multi-line selectors, we need to check if it ends with semicolon
                // If current line doesn't end with semicolon, it's likely multi-line
                // We'll validate the complete selector by checking if we can find the semicolon
                // in subsequent lines (but we won't re-read, just skip detailed validation)
                // The real validation is that the file should be syntactically correct JavaScript
            }

            // Check for await statements - only flag if we're NOT inside ANY function
            // We're inside a function if functionDepthStack has any entries
            if (trimmed.StartsWith("await ") && functionDepthStack.Count == 0)
            {
                errors.Add(
                    $"Line {lineNumber}: await statement found outside function - must be inside test() or hook"
                );
            }
        }

        if (duplicateSelectors.Any())
        {
            errors.Add($"Duplicate selectors: {string.Join(", ", duplicateSelectors.Distinct())}");
        }

        // Check for syntax errors
        if (content.Contains("// Error"))
        {
            errors.Add("Test file contains error comments");
        }

        // Note: We don't check for incomplete lines ending with '(' because
        // multi-line selectors and function calls legitimately end with '('
        // The JavaScript engine will catch actual syntax errors at runtime

        return errors;
    }

    private static string FilterTestCafeImports(string importLine)
    {
        // Remove 't' from TestCafe import statements
        // Example: "import { ClientFunction, Selector, t } from 'testcafe';"
        //       -> "import { ClientFunction, Selector } from 'testcafe';"

        var (module, imports) = ParseImportStatement(importLine);
        if (module == "testcafe")
        {
            // Filter out 't' from imports
            var filteredImports = imports
                .Where(imp => !string.Equals(imp, "t", StringComparison.Ordinal))
                .ToList();

            if (filteredImports.Count == 0)
            {
                // If no imports remain, return empty line
                return string.Empty;
            }

            // Reconstruct the import statement
            var importsString = string.Join(", ", filteredImports);
            return $"import {{ {importsString} }} from '{module}';";
        }

        return importLine; // Return unchanged if not a testcafe import
    }

    private static (string module, List<string> imports) ParseImportStatement(
        string importStatement
    )
    {
        // Parse: import { Selector, ClientFunction } from 'testcafe';
        var singleQuotePattern = @"import\s*\{\s*([^}]+)\s*\}\s*from\s*'([^']+)'\s*;?";
        var doubleQuotePattern = @"import\s*\{\s*([^}]+)\s*\}\s*from\s*""([^""]+)""\s*;?";

        var match = System.Text.RegularExpressions.Regex.Match(importStatement, singleQuotePattern);
        if (!match.Success)
        {
            match = System.Text.RegularExpressions.Regex.Match(importStatement, doubleQuotePattern);
        }

        if (match.Success)
        {
            var module = match.Groups[2].Value;
            var imports = match
                .Groups[1]
                .Value.Split(',')
                .Select(s => s.Trim())
                .Where(s => !string.IsNullOrEmpty(s))
                .ToList();
            return (module, imports);
        }

        return (string.Empty, new List<string>());
    }

    private (
        List<string> selectors,
        List<string> functions,
        string testCode
    ) ExtractSelectorsAndFunctions(string scriptBody, Guid testCaseId)
    {
        var selectors = new List<string>();
        var functions = new List<string>();
        var remainingLines = new List<string>();

        using var reader = new StringReader(scriptBody);
        string? line;
        var braceDepth = 0;
        var inTest = false;
        var testCaseIdInjected = false;

        while ((line = reader.ReadLine()) != null)
        {
            var trimmed = line.TrimStart();

            // Skip fixture declarations as they'll be consolidated
            if (
                trimmed.StartsWith("fixture`")
                || trimmed.StartsWith("fixture(")
                || trimmed.StartsWith(".page")
            )
            {
                continue;
            }

            // Track if we're inside a test block
            if (
                trimmed.StartsWith("test(")
                || trimmed.StartsWith("test.skip(")
                || trimmed.StartsWith("test.only(")
            )
            {
                inTest = true;
                braceDepth = 0; // Reset brace depth when entering test
                testCaseIdInjected = false; // Reset injection flag for new test
            }

            // Track brace depth to know when test ends
            if (inTest)
            {
                var previousDepth = braceDepth;
                braceDepth += trimmed.Count(c => c == '{');
                braceDepth -= trimmed.Count(c => c == '}');

                // Add the line to remaining lines (keep everything inside test)
                remainingLines.Add(line);

                // Inject TEST_CASE_ID comment right after test opening brace
                // Check if we just entered the test body (depth went from 0 to 1+)
                if (!testCaseIdInjected && previousDepth == 0 && braceDepth > 0)
                {
                    var indent = new string(' ', line.Length - line.TrimStart().Length + 4);
                    remainingLines.Add($"{indent}// TEST_CASE_ID: {testCaseId}");
                    testCaseIdInjected = true;
                }

                // If we're back to depth 0 and we see });, the test has ended
                if (braceDepth == 0 && trimmed == "});")
                {
                    inTest = false;
                }
            }
            else
            {
                // Only extract selectors/functions that are OUTSIDE test blocks

                // Extract multi-line selector declarations
                if (trimmed.StartsWith("const ") && trimmed.Contains("Selector("))
                {
                    var selectorLines = new List<string> { line };

                    // Check if the selector is complete (ends with semicolon)
                    if (!trimmed.TrimEnd().EndsWith(";"))
                    {
                        // Read continuation lines until we find the semicolon
                        string? nextLine;
                        while ((nextLine = reader.ReadLine()) != null)
                        {
                            selectorLines.Add(nextLine);
                            if (nextLine.TrimEnd().EndsWith(";"))
                            {
                                break;
                            }
                        }
                    }

                    // Join all lines into a single selector declaration
                    var fullSelector = string.Join("\n", selectorLines);
                    selectors.Add(fullSelector);
                    continue;
                }

                // Extract multi-line ClientFunction declarations
                if (trimmed.StartsWith("const ") && trimmed.Contains("ClientFunction("))
                {
                    var functionLines = new List<string> { line };

                    // Check if the function is complete (ends with semicolon)
                    if (!trimmed.TrimEnd().EndsWith(";"))
                    {
                        // Read continuation lines until we find the semicolon
                        string? nextLine;
                        while ((nextLine = reader.ReadLine()) != null)
                        {
                            functionLines.Add(nextLine);
                            if (nextLine.TrimEnd().EndsWith(";"))
                            {
                                break;
                            }
                        }
                    }

                    // Join all lines into a single function declaration
                    var fullFunction = string.Join("\n", functionLines);
                    functions.Add(fullFunction);
                    continue;
                }
            }
        }

        return (selectors, functions, string.Join("\n", remainingLines));
    }

    /// <summary>
    /// Ensures that the generated TestCafe file has all required imports from 'testcafe'
    /// based on the APIs that are actually used in the content (Selector, ClientFunction, Role, t, etc.).
    /// Existing named imports from 'testcafe' are normalized into a single statement and merged
    /// with any newly detected usages.
    /// </summary>
    private static string EnsureTestCafeImports(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            return content;

        // Detect used TestCafe APIs in the generated content
        var usedApis = new HashSet<string>(StringComparer.Ordinal);

        if (content.Contains("Selector("))
            usedApis.Add("Selector");

        if (
            System.Text.RegularExpressions.Regex.IsMatch(
                content,
                @"\bClientFunction\s*\(",
                System.Text.RegularExpressions.RegexOptions.Multiline
            )
        )
            usedApis.Add("ClientFunction");

        if (
            System.Text.RegularExpressions.Regex.IsMatch(
                content,
                @"\bRole\.",
                System.Text.RegularExpressions.RegexOptions.Multiline
            )
        )
            usedApis.Add("Role");

        if (
            System.Text.RegularExpressions.Regex.IsMatch(
                content,
                @"\bRequestLogger\b",
                System.Text.RegularExpressions.RegexOptions.Multiline
            )
        )
            usedApis.Add("RequestLogger");

        if (
            System.Text.RegularExpressions.Regex.IsMatch(
                content,
                @"\bRequestMock\b",
                System.Text.RegularExpressions.RegexOptions.Multiline
            )
        )
            usedApis.Add("RequestMock");

        // Detect usage of the TestCafe test controller `t`.
        // We look for common patterns where `t` appears as an identifier followed by a dot or is awaited.
        // This avoids adding `t` just because it appears as part of another identifier.
        if (
            System.Text.RegularExpressions.Regex.IsMatch(
                content,
                @"\bawait\s+t\b|\bt\.",
                System.Text.RegularExpressions.RegexOptions.Multiline
            )
        )
        {
            usedApis.Add("t");
        }

        // If no known APIs are used, we don't need to touch imports
        if (!usedApis.Any())
            return content;

        var lines = content.Split('\n');
        var outputLines = new List<string>();

        // Collect existing named imports from 'testcafe'
        var existingApis = new HashSet<string>(StringComparer.Ordinal);

        foreach (var line in lines)
        {
            var trimmed = line.Trim();

            // Match: import { A, B } from 'testcafe'; or "testcafe"
            var match = System.Text.RegularExpressions.Regex.Match(
                trimmed,
                "^import\\s*\\{([^}]+)\\}\\s*from\\s*['\\\"]testcafe['\\\"]\\s*;?\\s*$"
            );

            if (match.Success)
            {
                var imports = match
                    .Groups[1]
                    .Value.Split(',')
                    .Select(x => x.Trim())
                    .Where(x => !string.IsNullOrEmpty(x));

                foreach (var imp in imports)
                    existingApis.Add(imp);

                // Do not add this line to outputLines; we'll re-emit a normalized import later
                continue;
            }

            // Keep all non-testcafe import lines and code as-is
            outputLines.Add(line);
        }

        // Merge existing + used APIs
        foreach (var api in usedApis)
            existingApis.Add(api);

        if (!existingApis.Any())
            return string.Join("\n", outputLines);

        var allApis = existingApis.OrderBy(x => x).ToList();
        var testCafeImportLine = $"import {{ {string.Join(", ", allApis)} }} from 'testcafe';";

        // Prepend the normalized testcafe import line at the very top
        var finalLines = new List<string> { testCafeImportLine };
        finalLines.AddRange(outputLines);

        return string.Join("\n", finalLines);
    }

    private static string ToSlug(string input)
    {
        if (string.IsNullOrEmpty(input))
            return "unnamed";

        // Convert to lowercase
        var slug = input.ToLowerInvariant();

        // Replace spaces and underscores with hyphens
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[\s_]+", "-");

        // Remove special characters except hyphens
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\-]", "");

        // Remove duplicate hyphens
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-");

        // Trim hyphens from start and end
        slug = slug.Trim('-');

        return string.IsNullOrEmpty(slug) ? "unnamed" : slug;
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
