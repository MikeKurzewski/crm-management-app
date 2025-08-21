import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: return members of the org with profile info (RLS applies)
// PUT: admin-only, change member role via set_member_role RPC

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Query members with profile info (raw SQL, not RPC)
  const { data, error } = await supabase
    .from("organization_members")
    .select(`
      user_id,
      role,
      profiles:profiles(full_name, avatar_url),
      auth_users:auth.users(email)
    `)
    .eq("org_id", id)
    .order("role", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Map to expected shape
  const mapped = (data || []).map((m: any) => ({
    user_id: m.user_id,
    role: m.role,
    display_name: m.profiles?.full_name || m.auth_users?.email || "Unknown",
    email: m.auth_users?.email || "",
    avatar_url: m.profiles?.avatar_url || "",
  }));

  return NextResponse.json(mapped);
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
  const { data: me, error: meErr } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (meErr || !me || me.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Parse body
  const { userId, role } = await request.json();
  if (!userId || !["admin", "member"].includes(role)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Call set_member_role RPC
  const { error } = await supabase.rpc("set_member_role", {
    p_org_id: id,
    p_user_id: userId,
    p_role: role,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
