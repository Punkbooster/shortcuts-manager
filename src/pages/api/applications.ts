import type { ApplicationDto } from "../../types";
import { createApplicationSchema, formatZodError } from "../../lib/validation";
import { Errors } from "../../lib/errors";
import type { APIRoute } from "astro";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";

export const prerender = false;

type DbClient = SupabaseClient<Database>;

async function checkNameConflict(
  client: DbClient,
  name: string
): Promise<boolean> {
  const { data, error } = await client
    .from("applications")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (error) throw new Error("Failed to check for existing applications");
  return !!data;
}

async function insertApplication(
  client: DbClient,
  name: string
): Promise<ApplicationDto> {
  const { data: application, error } = await client
    .from("applications")
    .insert({ name })
    .select()
    .single();

  if (error) {
    console.error("Database error:", error);
    throw new Error(`Failed to create application: ${error.message}`);
  }

  if (!application) {
    throw new Error("Application was not created - no data returned");
  }

  return application;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const parsed = createApplicationSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Errors.validation(formatZodError(parsed.error));
    }

    const { name } = parsed.data;

    // Check for name conflicts
    const hasConflict = await checkNameConflict(locals.supabase, name);
    if (hasConflict) {
      return Errors.conflict("An application with this name already exists");
    }

    // Create application
    const application = await insertApplication(locals.supabase, name);

    return new Response(JSON.stringify(application), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error creating application:", error);
    return Errors.serverError();
  }
};
