import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: return org metadata (RLS restricts to members)
// PUT: update org (admin-only)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch org metadata (RLS enforced)
  const { data: org, error } = await supabase
    .from("organizations")
    .select("id, name, description, logo_url")
    .eq("id", id)
    .single();

  if (error || !org) {
    return NextResponse.json({ error: error?.message || "Not found" }, { status: 404 });
  }

  return NextResponse.json(org);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Check if user is admin for this org
  const { data: { user } = {} } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", id)
    .eq("user_id", user.id)
    .single();
  if (membership?.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Parse body
  const body = await request.json();
  const { name, description, logo_url } = body;

  // Update org
  const { data: updated, error } = await supabase
    .from("organizations")
    .update({ name, description, logo_url })
    .eq("id", id)
    .select("id")
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: error?.message || "Update failed" }, { status: 400 });
  }

  return NextResponse.json({ id: updated.id });
}
