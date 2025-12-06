using System;
using Serilog;

namespace Shared.Logging;

public static class SharedLogger
{
    public static void Debug(string message, object? data = null)
    {
        if (data is null)
            Log.Debug("{Message}", message);
        else
            Log.Debug("{Message} {@Data}", message, data);
    }

    public static void Info(string message, object? data = null)
    {
        if (data is null)
            Log.Information("{Message}", message);
        else
            Log.Information("{Message} {@Data}", message, data);
    }

    public static void Warn(string message, object? data = null)
    {
        if (data is null)
            Log.Warning("{Message}", message);
        else
            Log.Warning("{Message} {@Data}", message, data);
    }

    public static void Error(string message, Exception ex, object? data = null)
    {
        if (data is null)
            Log.Error(ex, "{Message}", message);
        else
            Log.Error(ex, "{Message} {@Data}", message, data);
    }
}
