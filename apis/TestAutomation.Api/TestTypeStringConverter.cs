using System.Text.Json;
using System.Text.Json.Serialization;
using TestAutomation.Api.Models;

namespace TestAutomation.Api;

public class TestTypeStringConverter : JsonConverter<TestType>
{
    public override TestType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        return value?.ToLowerInvariant() switch
        {
            "steps" => TestType.Steps,
            "script" => TestType.Script,
            _ => TestType.Steps
        };
    }

    public override void Write(Utf8JsonWriter writer, TestType value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString().ToLowerInvariant());
    }
}