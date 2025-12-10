# Contract: Setup API

**Type**: SvelteKit Form Action
**Route**: `/setup`

## POST `/setup?/createAdmin`

Submits the initial setup form to create the admin user and configure the site.

### Request (FormData)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Admin email address. Must be valid format. |
| `password` | string | Yes | Admin password. Min 8 chars. |
| `name` | string | Yes | Admin full name. |
| `siteName` | string | Yes | Name of the LMS instance. |

### Response

#### Success (303 Redirect)
Redirects to `/dashboard` (or home).
Sets session cookie for the new user.

#### Error (400 Bad Request)
Returns `fail(400, { errors: { ... } })`

```json
{
  "type": "failure",
  "status": 400,
  "data": {
    "message": "Validation failed",
    "errors": {
      "email": ["Invalid email format"],
      "password": ["Password too short"]
    }
  }
}
```

#### Error (403 Forbidden)
If setup is already completed.

```json
{
  "type": "failure",
  "status": 403,
  "data": {
    "message": "Setup already completed"
  }
}
```
