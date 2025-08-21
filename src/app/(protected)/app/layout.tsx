import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/shell/Topbar";
import Sidebar from "@/components/shell/Sidebar";
import { ThemeProvider } from "@/components/theme-provider";
// import NewOrgForm from "@/components/NewOrgForm";

/**
 * Dashboard shell layout for /app (protected route group)
 * Fetches orgs + profile, renders Topbar, Sidebar, and main content.
 */
export default async function DashboardAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  // Auth guard
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    redirect("/signin");
  }

  // Fetch orgs for user (order by created_at desc)
  const { data: orgsRaw } = await supabase
    .from("organizations")
    .select("id, name")
    .order("created_at", { ascending: false });
  const orgs: { id: string; name: string }[] = orgsRaw ?? [];

  // Fetch profile for user
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", userData.user.id)
    .single();

  // If no orgs, show empty state (e.g., NewOrgForm)
  if (!orgs.length) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex flex-col">
          <Topbar />
          <main className="flex-1 flex items-center justify-center">
            {/* <NewOrgForm /> */}
            <div className="w-full max-w-md">
              <div className="rounded-lg shadow border bg-background p-6 flex flex-col items-center justify-center" role="status" aria-label="No organizations">
                <span className="text-2xl mb-2">🏢</span>
                <h2 className="text-lg font-semibold mb-1">No organizations found</h2>
                <p className="text-muted-foreground mb-2 text-center">You have not created or joined any organizations yet.</p>
                <span className="text-xs text-muted-foreground">NewOrgForm coming soon.</span>
              </div>
            </div>
          </main>
        </div>
      </ThemeProvider>
    );
  }

  // Get activeOrgId from parallel route segment (not available here; pass down as needed)
  // For now, use first org as activeOrgId placeholder
  const activeOrgId = orgs[0]?.id;

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Topbar />
        <div className="flex flex-1">
          <Sidebar orgs={orgs} activeOrgId={activeOrgId} profile={profile || {}} />
          <main className="flex-1 bg-background">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
