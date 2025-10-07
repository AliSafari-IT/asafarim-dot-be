using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace Core.Api.Controllers
{
    [ApiController]
    [Route("api/what-is-building")]
    public class WhatIsBuildingController : ControllerBase
    {
        private static readonly HttpClient _http = new HttpClient();
        private readonly IMemoryCache _cache;
        private readonly IConfiguration _config;

        public WhatIsBuildingController(IMemoryCache cache, IConfiguration config)
        {
            _cache = cache;
            _config = config;
        }

        public class WhatIsBuildingItem
        {
            public string Id { get; set; } = string.Empty;
            public string Title { get; set; } = string.Empty;
            public DateTimeOffset Date { get; set; }
            public string? Link { get; set; }
        }

        public class WhatIsBuildingResponse
        {
            public int Page { get; set; }
            public int PageSize { get; set; }
            public int Total { get; set; }
            public List<WhatIsBuildingItem> Items { get; set; } = new();
        }

        [HttpGet]
        public async Task<ActionResult<WhatIsBuildingResponse>> Get(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10
        )
        {
            if (page < 1)
                page = 1;
            if (pageSize < 1 || pageSize > 50)
                pageSize = 10;

            var cacheKey = $"wib:commits:p{page}:s{pageSize}";
            if (_cache.TryGetValue(cacheKey, out WhatIsBuildingResponse? cached) && cached != null)
            {
                return Ok(cached);
            }

            // Prepare GitHub request with optional token to avoid 403 rate limits
            var uri = new Uri(
                $"https://api.github.com/repos/AliSafari-IT/asafarim-dot-be/commits?per_page={pageSize}&page={page}"
            );
            var req = new HttpRequestMessage(HttpMethod.Get, uri);
            req.Headers.UserAgent.Add(new ProductInfoHeaderValue("asafarim-core-api", "1.0"));
            req.Headers.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/vnd.github+json")
            );

            var token =
                _config["GitHub:Token"] ?? Environment.GetEnvironmentVariable("GITHUB_TOKEN");
            if (!string.IsNullOrWhiteSpace(token))
            {
                req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }

            try
            {
                var res = await _http.SendAsync(req);
                if (!res.IsSuccessStatusCode)
                {
                    var body = await res.Content.ReadAsStringAsync();
                    var limit = res.Headers.TryGetValues("x-ratelimit-remaining", out var rem)
                        ? string.Join(',', rem)
                        : null;
                    var reset = res.Headers.TryGetValues("x-ratelimit-reset", out var rst)
                        ? string.Join(',', rst)
                        : null;
                    return StatusCode(
                        (int)res.StatusCode,
                        new
                        {
                            error = "GitHub API error",
                            status = (int)res.StatusCode,
                            response = body,
                            rateRemaining = limit,
                            rateReset = reset,
                        }
                    );
                }

                await using var stream = await res.Content.ReadAsStreamAsync();
                using var doc = await JsonDocument.ParseAsync(stream);
                var root = doc.RootElement;

                var items = new List<WhatIsBuildingItem>();
                foreach (var el in root.EnumerateArray())
                {
                    var sha = el.GetProperty("sha").GetString() ?? string.Empty;
                    var htmlUrl = el.GetProperty("html_url").GetString();
                    var commit = el.GetProperty("commit");
                    var message = commit.GetProperty("message").GetString() ?? "Commit";
                    var dateStr = commit.GetProperty("author").TryGetProperty("date", out var dProp)
                        ? dProp.GetString()
                        : null;
                    var date =
                        dateStr != null ? DateTimeOffset.Parse(dateStr) : DateTimeOffset.UtcNow;

                    items.Add(
                        new WhatIsBuildingItem
                        {
                            Id = sha,
                            Title = message.Split('\n')[0],
                            Date = date,
                            Link = htmlUrl,
                        }
                    );
                }

                // GitHub doesn't return a simple total; keep it unknown (-1)
                var response = new WhatIsBuildingResponse
                {
                    Page = page,
                    PageSize = pageSize,
                    Total = -1,
                    Items = items,
                };
                // Cache for a short time to reduce rate limit pressure
                _cache.Set(
                    cacheKey,
                    response,
                    new MemoryCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2),
                    }
                );
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
