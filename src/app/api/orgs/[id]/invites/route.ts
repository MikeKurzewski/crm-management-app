import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: list pending invites for the org (admins only)

export async function GET(
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

  // Query pending invites
  const { data, error } = await supabase
    .from("org_invites")
    .select("token, email, role, created_at, expires_at")
    .eq("org_id", id)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Build joinUrl for each invite
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.headers.get("origin") ||
    "http://localhost:3000";
  const invites = (data || []).map((invite) => ({
    ...invite,
    joinUrl: `${origin}/join/${invite.token}`,
  }));

  return NextResponse.json(invites);
}
