# Data Model: First Setup

## Schema Changes

### New Model: `SystemConfig`

Stores global application settings. Designed as a singleton (only one row expected).

```prisma
model SystemConfig {
  id        String   @id @default("default")
  siteName  String   @default("DrillSkill")
  isSetup   Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("system_config")
}
```

### Updates to `User`

Ensure the `role` field supports the 'admin' value.

```prisma
model User {
  // ... existing fields
  role String @default("user") // Values: "admin", "instructor", "learner"
}
```

## Data Lifecycle

1. **Initialization**: `SystemConfig` row created upon first successful setup completion.
2. **Validation**: `isSetup` flag used to gate access to the rest of the app.
