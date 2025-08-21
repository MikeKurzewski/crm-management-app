import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
// import NewOrgForm from "@/components/NewOrgForm";

export default async function AppPage() {
  const supabase = await createClient();

  // Fetch orgs for user (order by created_at desc)
  const { data: orgsRaw } = await supabase
    .from("organizations")
    .select("id, name")
    .order("created_at", { ascending: false });
  const orgs: { id: string; name: string }[] = orgsRaw ?? [];

  if (orgs.length > 0) {
    // Redirect to first org dashboard
    redirect(`/app/${orgs[0].id}`);
  }

  // No orgs: show empty state (NewOrgForm)
  return (
    <main className="flex min-h-screen items-center justify-center">
      {/* If NewOrgForm is available, render it here */}
      {/* <NewOrgForm /> */}
      <div className="text-muted-foreground">
        No organizations found. Please create an organization to get started.
      </div>
    </main>
  );
}
