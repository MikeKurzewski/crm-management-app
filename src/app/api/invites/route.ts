import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: create an invite (admin-only)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { orgId, email, role } = await request.json();

  // Get current user
  const { data: { user } = {} } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check this user's membership row (admin only)
  const { data: me, error: meErr } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (meErr || !me || me.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Call the create_org_invite RPC
  const { data: token, error } = await supabase.rpc("create_org_invite", {
    p_org_id: orgId,
    p_email: email,
    p_role: role ?? "member",
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  // Build joinUrl
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.headers.get("origin") ||
    "http://localhost:3000";
  const joinUrl = `${origin}/join/${token}`;

  return NextResponse.json({ token, joinUrl });
}
