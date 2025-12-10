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
    .WithHttpEndpoint(name: "login", port: 30030)
    .WithEnvironment("DATABASE_URL", db)
    .WithEnvironment("REDIS_URL", redis);

builder.Build().Run();
