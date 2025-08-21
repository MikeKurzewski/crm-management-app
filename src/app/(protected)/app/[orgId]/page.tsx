import { createClient } from "@/lib/supabase/server";

export default async function OrgDashboardHome({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const supabase = await createClient();

  // Fetch org name (RLS applies)
  const { data: org, error } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", orgId)
    .single();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">
        {org?.name ? `Welcome to ${org.name}` : "Organization"}
      </h1>
      <p className="mt-2 text-muted-foreground">Org ID: {orgId}</p>
      {/* Add more dashboard widgets here */}
      {error && (
        <div className="text-red-500 mt-4">Error loading organization: {error.message}</div>
      )}
    </div>
  );
}
