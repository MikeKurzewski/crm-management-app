import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export default async function OrgDashboardHome({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  // Placeholder: fetch org data if needed
  // const supabase = await createClient();
  // const { data: org } = await supabase.from("organizations").select("*").eq("id", orgId).single();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome to your organization dashboard</h1>
      <p className="mt-2 text-muted-foreground">Org ID: {orgId}</p>
      {/* Add more dashboard widgets here */}
    </div>
  );
}
