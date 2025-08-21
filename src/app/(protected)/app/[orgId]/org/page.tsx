import { createClient } from "@/lib/supabase/server";
import MembersTable from "@/components/org/MembersTable";
import PendingInvitesList from "@/components/org/PendingInvitesList";
import OrgForm from "@/components/org/OrgForm";
import InviteMemberForm from "@/components/InviteMemberForm";

export default async function OrgDetailsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const supabase = await createClient();

  // Fetch org fields
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, name, description, logo_url")
    .eq("id", orgId)
    .single();

  // Fetch current user
  const { data: { user } = {} } = await supabase.auth.getUser();

  // Fetch membership for this org
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user?.id)
    .single();

  const isAdmin = membership?.role === "admin";

  // Fetch members for the org (server-side, same as API)
  // Fetch members for the org (server-side, same as API)
  const { data: membersV = [], error: membersErr } = await supabase
    .from("org_members_view")
    .select("*")
    .eq("org_id", orgId);

  // Map to MembersTable shape (or pass membersV directly if your type matches)
  const mappedMembers = (membersV || []).map((m: any) => ({
    user_id: m.user_id,
    role: m.role,
    display_name: m.display_name || "Unknown",
    email: m.email || "",
    avatar_url: m.avatar_url || "",
  }));

  if (orgError || !org) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Organisation Not Found</h1>
        <p className="mt-2 text-muted-foreground">Org ID: {orgId}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-2">Organisation Details</h1>
      <div className="mb-4">
        <div className="font-semibold">Name:</div>
        <div>{org.name}</div>
        <div className="font-semibold mt-2">Description:</div>
        <div>{org.description || <span className="text-muted-foreground">No description</span>}</div>
        <div className="font-semibold mt-2">Logo URL:</div>
        <div>{org.logo_url || <span className="text-muted-foreground">No logo</span>}</div>
      </div>
      {isAdmin ? (
        <div>
          <OrgForm org={org} />
          <div className="mt-8">
            <InviteMemberForm orgs={[{ id: orgId, name: org.name }]} adminOrgIds={[orgId]} />
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground">You are a member of this organization.</div>
      )}
      <MembersTable
        orgId={orgId}
        initial={mappedMembers}
        isAdmin={isAdmin}
        currentUserId={user?.id || ""}
      />
      {isAdmin && <PendingInvitesList orgId={orgId} />}
    </div>
  );
}
