using Aspire.Hosting;
using System.Diagnostics;
using System.Runtime.InteropServices;

var builder = DistributedApplication.CreateBuilder(args);

var postgresPasswordResource = builder.AddParameter("postgres-password", "postgres");
var postgres = builder.AddPostgres("postgres")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithHostPort(51213)
    .WithPgWeb()
    .WithDataVolume("a1")
    .WithPassword(postgresPasswordResource)
    .WithEnvironment("POSTGRES_PASSWORD", "postgres");

var db = postgres.AddDatabase("drillskill");

var redis = builder.AddRedis("redis")
    .WithDataVolume();

builder.AddViteApp("web", "../DrillSkill.Web")
    .WithReference(db)
    .WithReference(redis)
    .WithHttpsEndpoint(env: "PORT", port: 5173, name: "https")
    .WithExternalHttpEndpoints()
    .WithEnvironment("DATABASE_URL", db)
    .WithEnvironment("REDIS_URL", redis)
    .WithEnvironment("STORAGE_PATH", "./uploads") // Local storage for uploads
    .WithCommand(
        "reset-db", 
        "Reset Database",
        executeCommand: async (context) =>
        {
            try
            {
                var webDir = Path.GetFullPath(Path.Combine(builder.AppHostDirectory, "../DrillSkill.Web"));
                var isWindows = RuntimeInformation.IsOSPlatform(OSPlatform.Windows);
                var fileName = isWindows ? "cmd" : "npx";
                var args = isWindows ? "/c npx prisma migrate reset --force" : "prisma migrate reset --force";

                var process = Process.Start(new ProcessStartInfo
                {
                    FileName = fileName,
                    Arguments = args,
                    WorkingDirectory = webDir,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                });

                if (process == null) return new ExecuteCommandResult { Success = false, ErrorMessage = "Failed to start process" };

                await process.WaitForExitAsync();

                if (process.ExitCode != 0)
                {
                    var error = await process.StandardError.ReadToEndAsync();
                    return new ExecuteCommandResult { Success = false, ErrorMessage = $"Exit Code: {process.ExitCode}. Error: {error}" };
                }

                return new ExecuteCommandResult { Success = true };
            }
            catch (Exception ex)
            {
                return new ExecuteCommandResult { Success = false, ErrorMessage = ex.Message };
            }
        },
        iconName: "Database",
        confirmationMessage: "Are you sure you want to reset the database? This will delete all data."
    );

builder.Build().Run();
