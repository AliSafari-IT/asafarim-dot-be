using System.Text;
using Identity.Api;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<AuthOptions>(builder.Configuration.GetSection("Auth"));
var authOpts =
    builder.Configuration.GetSection("Auth").Get<AuthOptions>()
    ?? new AuthOptions { Key = "dev-secret-key-please-change" };

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder
    .Services.AddIdentityCore<AppUser>(o =>
    {
        o.User.RequireUniqueEmail = true;
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager();

builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = authOpts.Issuer,
            ValidAudience = authOpts.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(authOpts.Key)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                if (ctx.Request.Cookies.TryGetValue("atk", out var token))
                    ctx.Token = token;
                return Task.CompletedTask;
            },
        };
    });

builder.Services.AddAuthorization();

var allowedOrigins = new[]
{
    "http://web.asafarim.local:5173",
    "http://app.asafarim.local:5174",
    "http://ai.asafarim.local:5175",
    "http://jobs.asafarim.local:4200",
    "http://blog.asafarim.local:3000",
};

builder.Services.AddCors(opt =>
    opt.AddPolicy(
        "app",
        p => p.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()
    )
);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("app");
app.UseSwagger();
app.UseSwaggerUI();
app.UseAuthentication();
app.UseAuthorization();

static void SetAuthCookies(
    HttpResponse res,
    string accessToken,
    string refreshToken,
    AuthOptions opts
)
{
    res.Cookies.Append(
        "atk",
        accessToken,
        new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // dev (same-site subdomains). set true + SameSite=None in prod
            SameSite = SameSiteMode.Lax,
            Domain = opts.CookieDomain,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddMinutes(opts.AccessMinutes),
        }
    );
    res.Cookies.Append(
        "rtk",
        refreshToken,
        new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Domain = opts.CookieDomain,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddDays(opts.RefreshDays),
        }
    );
}

app.MapPost(
    "/auth/register",
    async (RegisterRequest req, UserManager<AppUser> users, IConfiguration cfg) =>
    {
        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = req.Email,
            UserName = req.UserName ?? req.Email,
        };
        var result = await users.CreateAsync(user, req.Password);
        if (!result.Succeeded)
            return Results.ValidationProblem(
                result.Errors.ToDictionary(e => e.Code, e => new[] { e.Description })
            );

        return Results.Ok(new { message = "ok" });
    }
);

app.MapPost(
    "/auth/login",
    async (
        LoginRequest req,
        UserManager<AppUser> users,
        SignInManager<AppUser> signIn,
        IConfiguration cfg,
        HttpResponse res
    ) =>
    {
        var user = await users.FindByEmailAsync(req.Email);
        if (user is null)
            return Results.Unauthorized();

        var ok = await users.CheckPasswordAsync(user, req.Password);
        if (!ok)
            return Results.Unauthorized();

        var opts = cfg.GetSection("Auth").Get<AuthOptions>()!;
        var access = TokenService.CreateAccessToken(user, opts);
        var refresh = Guid.NewGuid().ToString("N"); // stub: store/rotate in DB for real usage
        SetAuthCookies(res, access, refresh, opts);
        return Results.Ok(new { message = "signed-in" });
    }
);

app.MapPost(
    "/auth/logout",
    (HttpResponse res) =>
    {
        res.Cookies.Delete("atk");
        res.Cookies.Delete("rtk");
        return Results.Ok();
    }
);

app.MapGet(
        "/auth/me",
        async (HttpContext ctx, UserManager<AppUser> users) =>
        {
            if (!ctx.User.Identity?.IsAuthenticated ?? true)
                return Results.Unauthorized();
            var sub = ctx.User.FindFirst("sub")?.Value;
            if (sub is null)
                return Results.Unauthorized();
            var user = await users.FindByIdAsync(sub);
            return user is null
                ? Results.Unauthorized()
                : Results.Ok(new MeResponse(user.Id.ToString(), user.Email, user.UserName));
        }
    )
    .RequireAuthorization();
app.Run("http://localhost:5101");