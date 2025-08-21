import { createClient } from "@/lib/supabase/server";
// import OrgForm from "@/components/org/OrgForm";
// import InviteMemberForm from "@/components/InviteMemberForm";

export default async function OrgDetailsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const supabase = await createClient();

  // Fetch org by id
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
          {/* <OrgForm org={org} /> */}
          <div className="mb-6 text-muted-foreground">Org edit form coming soon</div>
          {/* <InviteMemberForm orgs={[{id: orgId, name: org.name}]} adminOrgIds={[orgId]} /> */}
          <div className="text-muted-foreground">InviteMemberForm coming soon</div>
        </div>
      ) : (
        <div className="text-muted-foreground">You are a member of this organization.</div>
      )}
    </div>
  );
}
