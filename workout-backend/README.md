# Workout backend

NestJS API for the Workout product (TypeORM + MySQL). **Setup, scripts, testing, and CI** are documented in the [repository root README](../README.md).

## Integration API

Workout supports API keys for external integrations. API keys let other apps create or update notes and tasks.

### Create an API key

```
POST /api-keys
Authorization: Bearer <user token>

{
  "name": "Zapier",
  "scopes": ["notes:write", "tasks:write"]
}
```

Response includes `token` once. Store it securely.

### Use the API key

Send the key with each request:

```
X-API-Key: <token>
```

### Notes

```
POST /integrations/notes
PUT /integrations/notes/:id
DELETE /integrations/notes/:id
```

### Tasks

```
POST /integrations/tasks
PUT /integrations/tasks/:id
DELETE /integrations/tasks/:id
```

(Path prefix `workout/api/v1` applies in production; see root README.)
