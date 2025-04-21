# API Endpoint Implementation Plan: POST /groups

## 1. Endpoint Overview
The POST /groups endpoint creates a new keyboard shortcut group in the system. It requires user authentication, accepts the new group data in JSON format, and returns the created object with its assigned ID upon successful creation. The implementation will use Astro Server Endpoints and Supabase for database operations.

## 2. Request Details
- HTTP Method: POST
- URL Pattern: /api/groups
- Authentication: Bearer token (JWT issued by Supabase Auth)
- Request Body:
  ```json
  {
    "name": string,
    "application_id": "UUID",
    "operating_system": "string (enum: \"Windows\", \"macOS\", \"Linux\", \"Other\")"
  }
  ```
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer {token}

## 3. Type Definitions
```typescript
// Existing models from types.ts
import { CreateShortcutGroupCommand, ShortcutGroupDto } from "../types";

// Additional types for validation and errors
interface ValidationError {
  field: string;
  message: string;
}

interface ApiError {
  statusCode: number;
  message: string;
  errors?: ValidationError[];
}
```

## 4. Response Details
- Success (201 Created):
  ```json
  {
    "id": "UUID",
    "name": "string",
    "application_id": "UUID",
    "operating_system": "string (enum)",
    "user_id": "UUID"
  }
  ```
- Error (400 Bad Request):
  ```json
  {
    "statusCode": 400,
    "message": "Invalid input",
    "errors": [
      { "field": "name", "message": "Name is required" }
    ]
  }
  ```
- Error (409 Conflict):
  ```json
  {
    "statusCode": 409,
    "message": "A group with this name already exists"
  }
  ```
- Error (401 Unauthorized):
  ```json
  {
    "statusCode": 401,
    "message": "Authentication required"
  }
  ```

## 5. Data Flow
1. The request is routed to the POST /api/groups endpoint.
2. Astro middleware injects the Supabase client into the request context.
3. The endpoint extracts the JWT from the Authorization header.
4. The JWT is verified and the user's ID is retrieved from Supabase.
5. Input data is validated for:
   - Required fields (name, application_id, operating_system)
   - Valid UUID format for application_id
   - Valid enum value for operating_system
6. The endpoint checks that the application with the given application_id exists.
7. It verifies that no existing group has the same name for this user and application.
8. A new record is inserted into the `shortcut_groups` table with fields:
   - name
   - application_id
   - operating_system
   - user_id
9. The created object is returned with HTTP status 201.

## 6. Security Considerations
1. Authenticate users via Supabase JWT tokens.
2. Validate input data before any database interaction.
3. Sanitize inputs to prevent SQL injection and XSS.
4. Rely on Supabase Row Level Security (RLS) to ensure users only modify their own data.

## 7. Error Handling
1. Missing or invalid authentication: 401 Unauthorized
2. Invalid request payload: 400 Bad Request with detailed errors
3. Name conflict: 409 Conflict
4. Nonexistent application: 400 Bad Request
5. Database or server error: 500 Internal Server Error
6. Invalid UUID format: 400 Bad Request
7. Invalid enum value: 400 Bad Request

## 8. Performance Considerations
1. Ensure indexes on user_id, application_id, and name in `shortcut_groups`.
2. Optimize database queries to fetch only necessary columns.
3. Use Supabase connection pooling for efficient connection management.
4. Reduce round trips by using a single insert query when creating the group.

## 9. Implementation Steps
1. Create the directory structure:
   ```
   src/
     pages/
       api/
         groups.ts
     lib/
       validation.ts
       errors.ts
   ```
2. Implement input validation in `src/lib/validation.ts`:
3. Implement error helper in `src/lib/errors.ts`:
4. Implement the POST handler in `src/pages/api/groups.ts`:
