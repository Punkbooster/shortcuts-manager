# REST API Plan

## 1. Resources
- User (`users`)
- Application (`applications`)
- Shortcut Group (`shortcut_groups`)
- Shortcut (`shortcuts`)
- Group Shortcut Link (`group_shortcuts`)

## 2. Endpoints

### 2.1 Authentication
- TODO

### 2.2 Applications

#### GET /applications
- Description: List applications, optional filter by os
- Query Params:
  - `os` (enum: Windows, macOS, Linux, Other)
  - `limit` (int), `offset` (int)
- Response 200:
  {
    "data": [ { "id": UUID, "name": string } ],
    "paging": { "limit": int, "offset": int, "total": int }
  }

#### GET /applications/{id}
- Description: Get details of a single application
- Response 200: { "id": UUID, "name": string }
- Errors: 404 not found

### 2.3 Shortcuts

#### GET /shortcuts
- Description: List or search shortcuts
- Query Params:
  - `search` (string, fuzzy on name or keys)
  - `applicationId` (UUID)
  - `limit`, `offset`
- Response 200:
  {
    "data": [ { "id": UUID, "name": string, "keys": string } ],
    "paging": { ... }
  }

#### GET /shortcuts/{id}
- Description: Get a shortcut by ID
- Response 200: { "id": UUID, "name": string, "keys": string }
- Errors: 404 not found

#### POST /shortcuts
- Description: Create a new shortcut
- Auth: Bearer token required
- Request Body:
  { "name": string, "keys": string }
- Response 201: { "id": UUID, "name": string, "keys": string }
- Errors: 400 invalid input, 409 name conflict

#### PATCH /shortcuts/{id}
- Description: Update an existing shortcut
- Auth: Bearer token required
- Request Body:
  { "name"?: string, "keys"?: string }
- Response 200: updated shortcut object
- Errors: 400 invalid input, 404 not found

#### DELETE /shortcuts/{id}
- Description: Delete a shortcut
- Auth: Bearer token required
- Response 204 No Content
- Errors: 404 not found

### 2.4 Shortcut Groups

#### GET /groups
- Description: List user’s groups or public groups
- Auth: Bearer token required
- Query Params:
  - `limit`, `offset`
- Response 200:
  {
    "data": [
      { "id": UUID, "name": string, "applicationId": UUID, "operatingSystem": string, "userId": UUID | null }
    ],
    "paging": { ... }
  }

#### POST /groups
- Description: Create a new shortcut group
- Auth: Bearer token
- Request Body:
  {
    "name": string,
    "applicationId": UUID,
    "operatingSystem": string (enum)
  }
- Response 201: created group object
- Errors: 400 invalid input, 409 name conflict

#### GET /groups/{id}
- Description: Get group details and metadata
- Auth: Bearer token
- Response 200:
  { "id": UUID, "name": string, "applicationId": UUID, "operatingSystem": string, "userId": UUID | null }
- Errors: 404 not found, 403 forbidden

#### PATCH /groups/{id}
- Description: Update group name or metadata
- Auth: Bearer token
- Request Body (any of):
  {
    "name": string,
    "applicationId": UUID,
    "operatingSystem": string
  }
- Response 200: updated object
- Errors: 400 invalid input, 403 forbidden

#### DELETE /groups/{id}
- Description: Delete a shortcut group
- Auth: Bearer token
- Response 204 No Content
- Errors: 403 forbidden, 404 not found

### 2.5 Group Shortcut Links

#### GET /groups/{groupId}/shortcuts
- Description: List shortcuts in a group
- Auth: Bearer token
- Response 200:
  { "data": [ { "id": UUID, "name": string, "keys": string } ] }

#### POST /groups/{groupId}/shortcuts
- Description: Add existing shortcut to group
- Auth: Bearer token
- Request Body:
  { "shortcutId": UUID }
- Response 201:
  { "groupId": UUID, "shortcutId": UUID }
- Errors: 400 invalid input, 403 forbidden, 409 already linked

#### PATCH /groups/{groupId}/shortcuts/{shortcutId}
- Description: Edit details of a linked shortcut (optional if modifying name/keys locally)
- Auth: Bearer token
- Request Body:
  { "name"?: string, "keys"?: string }
- Response 200: updated shortcut
- Errors: 403 forbidden, 404 not found

#### DELETE /groups/{groupId}/shortcuts/{shortcutId}
- Description: Remove shortcut from group
- Auth: Bearer token
- Response 204 No Content
- Errors: 403 forbidden, 404 not found

## 3. Authentication & Authorization
- Mechanism: JWT tokens issued by Supabase Auth
- All group and link endpoints require Bearer token
- RLS enforced: users only access own `shortcut_groups` or public ones (`user_id IS NULL`)
- Policies: enforce insert/update/delete only on own resources

## 4. Validation & Business Logic
- Enforce not-null and unique constraints at API layer
- Validate `operatingSystem` against enum [Windows, macOS, Linux, Other]
- Pagination on list endpoints via `limit` & `offset`, default limit=20, max=100
- Filtering: by `applicationId`, `operatingSystem`, and fuzzy `search` on shortcuts
- Sorting: optional `sortBy` and `order` params on lists
- Implement rate limiting on search endpoints (e.g., 10 req/s/user)
- Cascading: deleting user sets `user_id` to null on groups; DB handles foreign key cascades
- Error handling: standardized error response format with codes and messages
- For shortcuts, ensure the "keys" field is non-null and conforms to valid keyboard combination syntax (e.g., "Ctrl+Alt+Delete").
