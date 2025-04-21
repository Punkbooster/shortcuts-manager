import { Tables, TablesInsert, TablesUpdate, Database } from "./db/database.types";

/**
 * Application DTO for GET /applications and GET /applications/{id}
 */
export type ApplicationDto = Pick<Tables<'applications'>, 'id' | 'name'>;

/**
 * Shortcut DTO for GET /shortcuts, GET /shortcuts/{id}, and GET group shortcuts
 */
export type ShortcutDto = Pick<Tables<'shortcuts'>, 'id' | 'name' | 'keys'>;

/**
 * Command model for creating a new shortcut (POST /shortcuts)
 * Includes group_id param as query parameter
 */
export type CreateShortcutCommand = {
  /** Group UUID to associate the new shortcut */
  group_id: Tables<'shortcut_groups'>['id'];
} & Pick<
  TablesInsert<'shortcuts'>,
  'name' | 'keys'
>;

/**
 * Command model for updating an existing shortcut (PATCH /shortcuts/{id})
 * Includes group_id param as query parameter
 */
export type UpdateShortcutCommand = {
  /** Group UUID context for the shortcut update */
  group_id: Tables<'shortcut_groups'>['id'];
} & Partial<
  Pick<TablesUpdate<'shortcuts'>, 'name' | 'keys'>
>;

// Helper to reference DB row for shortcut_groups
type DbShortcutGroup = Tables<'shortcut_groups'>;

/**
 * Shortcut Group DTO for GET /groups and GET /groups/{id}
 * API contract uses snake_case to match DB field naming
 */
export interface ShortcutGroupDto {
  id: DbShortcutGroup['id'];
  name: DbShortcutGroup['name'];
  application_id: DbShortcutGroup['application_id'];
  operating_system: DbShortcutGroup['operating_system'];
  user_id: DbShortcutGroup['user_id'];
}

/**
 * Command model for creating a new shortcut group (POST /groups)
 */
export type CreateShortcutGroupCommand = {
  name: TablesInsert<'shortcut_groups'>['name'];
  application_id: TablesInsert<'shortcut_groups'>['application_id'];
  operating_system: TablesInsert<'shortcut_groups'>['operating_system'];
};

/**
 * Command model for updating an existing shortcut group (PATCH /groups/{id})
 */
export type UpdateShortcutGroupCommand = Partial<
  Pick<CreateShortcutGroupCommand, 'name' | 'application_id' | 'operating_system'>
>;

/**
 * Command model for adding an existing shortcut to a group (POST /groups/{groupId}/shortcuts)
 */
export type AddShortcutToGroupCommand = {
  // Using snake_case to map to DB 'shortcut_id'
  shortcut_id: TablesInsert<'group_shortcuts'>['shortcut_id'];
};

/**
 * DTO for the link created between group and shortcut (POST response)
 */
export interface GroupShortcutDto {
  group_id: Tables<'group_shortcuts'>['group_id'];
  shortcut_id: Tables<'group_shortcuts'>['shortcut_id'];
}

/**
 * Command model for updating linked shortcut details (PATCH /groups/{groupId}/shortcuts/{shortcutId})
 * Directly reuses shortcut updates; treating link-level name/keys as shortcut modifications
 */
export type UpdateGroupShortcutCommand = Partial<
  Pick<TablesUpdate<'shortcuts'>, 'name' | 'keys'>
>;

/**
 * Pagination metadata for list responses
 */
export interface Paging {
  limit: number;
  offset: number;
  total: number;
}

/**
 * Generic List DTO
 */
export interface ListDto<T> {
  data: T[];
  paging: Paging;
}

/**
 * Specific list response DTOs
 */
export type ApplicationListDto = ListDto<ApplicationDto>;
export type ShortcutListDto = ListDto<ShortcutDto>;
export type ShortcutGroupListDto = ListDto<ShortcutGroupDto>;

/**
 * DTO for listing shortcuts in a specific group (no paging)
 */
export interface GroupShortcutsDto {
  data: ShortcutDto[];
}
