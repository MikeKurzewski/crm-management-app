import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("org_members_view")
    .select("*")
    .eq("org_id", id)
    .order("role", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // data already matches MembersTable shape (user_id, role, display_name, email, avatar_url)
  return NextResponse.json(data ?? []);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const supabase = await createClient();

  const { data: { user } = {} } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { data: me } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { userId, role } = await request.json();
  if (!userId || !["admin", "member"].includes(role)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { error } = await supabase.rpc("set_member_role", {
    p_org_id: id,
    p_user_id: userId,
    p_role: role,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
