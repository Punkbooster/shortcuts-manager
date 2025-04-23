import type { APIRoute } from 'astro';
import type { CreateShortcutGroupCommand, ShortcutGroupDto } from '../../types';
import { createShortcutGroupSchema, formatZodError } from '../../lib/validation';
import { Errors } from '../../lib/errors';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../db/database.types';

export const prerender = false;

type DbClient = SupabaseClient<Database>;

async function verifyApplication(client: DbClient, applicationId: string): Promise<boolean> {
  const { data, error } = await client
    .from('applications')
    .select('id')
    .eq('id', applicationId)
    .single();

  return !error && !!data;
}

async function checkNameConflict(
  client: DbClient,
  userId: string,
  applicationId: string,
  name: string
): Promise<boolean> {
  const { data, error } = await client
    .from('shortcut_groups')
    .select('id')
    .eq('name', name)
    .eq('user_id', userId)
    .eq('application_id', applicationId)
    .maybeSingle();

  if (error) throw new Error('Failed to check for existing groups');
  return !!data;
}

async function insertGroup(
  client: DbClient,
  userId: string,
  data: CreateShortcutGroupCommand
): Promise<ShortcutGroupDto> {
  const { data: group, error } = await client
    .from('shortcut_groups')
    .insert({
      name: data.name,
      application_id: data.application_id,
      operating_system: data.operating_system,
      user_id: userId
    })
    .select()
    .single();

  if (error || !group) {
    throw new Error('Failed to create shortcut group');
  }

  return group;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Mock authenticate user
    const { data: user, error: authError } = await locals.supabase
      .from("users")
      .select("*")
      .limit(1)
      .maybeSingle();

    // Parse and validate request body
    const parsed = createShortcutGroupSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Errors.validation(formatZodError(parsed.error));
    }

    const data = parsed.data;

    // Verify application exists
    const applicationExists = await verifyApplication(locals.supabase, data.application_id);
    if (!applicationExists) {
      return Errors.notFound('Application');
    }

    // Check for name conflicts
    const hasConflict = await checkNameConflict(
      locals.supabase,
      user.id,
      data.application_id,
      data.name
    );
    if (hasConflict) {
      return Errors.conflict('A group with this name already exists for this application');
    }

    // Create group
    const group = await insertGroup(locals.supabase, user.id, data);

    return new Response(JSON.stringify(group), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating shortcut group:', error);
    return Errors.serverError();
  }
};
