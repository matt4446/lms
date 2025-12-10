var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithHostPort(51213)
    .WithPgWeb()
    .WithDataVolume()
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
    .WithEnvironment("REDIS_URL", redis);

builder.Build().Run();
