## Database Schema (MVP) - Revised with Many-to-Many Shortcuts, RLS, and Cascading Rules

### 1. Users
*(Note: This table is managed by Supabase Authentication.)*

-   **id**: UUID PRIMARY KEY
-   **email**: VARCHAR(255) NOT NULL UNIQUE
-   **encrypted_password**: VARCHAR(255) NOT NULL
-   **name**: VARCHAR(255)
-   **created_at**: TIMESTAMP WITH TIME ZONE NOT NULL
-   **confirmed_at**: TIMESTAMP WITH TIME ZONE

### 2. Applications

-   **id**: UUID PRIMARY KEY
-   **name**: VARCHAR(255) NOT NULL UNIQUE

### 3. Shortcut Groups

-   **id**: UUID PRIMARY KEY
-   **name**: VARCHAR(255) NOT NULL
-   **description**: TEXT
-   **operating_system**: ENUM ('Windows', 'macOS', 'Linux', 'Other') NOT NULL -- Using an ENUM type
-   **application_id**: UUID NOT NULL (Foreign Key referencing `Applications.id`)
-   **user_id**: UUID (Foreign Key referencing `Users.id`) -- NULLable

### 4. Shortcuts

-   **id**: UUID PRIMARY KEY
-   **name**: VARCHAR(255) NOT NULL
-   **keys**: VARCHAR(255) NOT NULL

### 5. group_shortcuts (Join Table)

-   **group_id**: UUID NOT NULL (Foreign Key referencing `Shortcut Groups.id`)
-   **shortcut_id**: UUID NOT NULL (Foreign Key referencing `Shortcuts.id`)
-   PRIMARY KEY (group_id, shortcut_id) -- Composite primary key to ensure uniqueness of the relationship

---

## Relationships

-   One user (`users`) can have many shortcut groups (`shortcut_groups`). A shortcut group (`shortcut_groups`) optionally belongs to one user (`users`). (One-to-many)
-   One application (`applications`) can be associated with many shortcut groups (`shortcut_groups`). A shortcut group (`shortcut_groups`) odnosi się do jednej aplikacji (`applications`). (One-to-many)
-   Shortcut groups (`shortcut_groups`) and shortcuts (`shortcuts`) have a many-to-many relationship, implemented via the `group_shortcuts` join table. One group can contain many shortcuts, and one shortcut can belong to many groups. (Many-to-many)
-   Each shortcut group (`shortcut_groups`) refers to one operating system from the predefined ENUM list. (Conceptual relationship via ENUM)

---

## Indexes

-   **Users**:
    -   Index on `email` (implied by UNIQUE).
-   **Applications**:
    -   Index on `name` (implied by UNIQUE).
-   **Shortcut Groups**:
    -   Index on `application_id`.
    -   Index on `user_id`.
    -   Index on `operating_system`.
-   **Shortcuts**:
    -   Index on `name` (if needed for search/filter).
-   **group_shortcuts**:
    -   Composite index on `(group_id, shortcut_id)` (PK).
    -   Index on `group_id`.
    -   Index on `shortcut_id`.

---

## Row-Level Security (RLS) Policies

*(Note: Policies evaluate who can access/modify rows.)*

-   **`Shortcut Groups`:**
    -   Users can SELECT their own groups (`user_id = auth.uid()`) or public groups (`user_id IS NULL`).
    -   Users can INSERT, UPDATE, DELETE only their own groups (`user_id = auth.uid()`). Admin required for public groups.
-   **`Shortcuts` and `group_shortcuts`:**
    -   Users can SELECT shortcuts/links if the associated `Shortcut Group` (via `group_shortcuts`) is accessible to them (based on `Shortcut Groups` SELECT policy).
    -   Users can INSERT/UPDATE/DELETE links in `group_shortcuts` or modify `Shortcuts` only if the associated `Shortcut Group` allows them modification rights (based on `Shortcut Groups` UPDATE/DELETE policy).

---

## Referential Integrity (Cascading Rules)

*(Note: Defines `ON DELETE` behavior for foreign keys.)*

-   `Shortcut Groups.user_id`: `ON DELETE SET NULL`. Deleting a user orphans their groups (sets `user_id` to NULL).
-   `Shortcut Groups.application_id`: `ON DELETE SET NULL`. Deleting an application orphans related groups (sets `application_id` to NULL).
