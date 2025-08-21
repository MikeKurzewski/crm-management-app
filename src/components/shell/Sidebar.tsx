import React from "react";
// import { OrgSwitcher } from "@/components/org/OrgSwitcher";
// import { ProfileCard } from "@/components/profile/ProfileCard";
// import { AppNav } from "@/components/nav/AppNav";

export function Sidebar({
  orgs,
  activeOrgId,
  profile,
}: {
  orgs: Array<{ id: string; name: string }>;
  activeOrgId: string;
  profile: { full_name?: string; avatar_url?: string };
}) {
  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen border-r bg-background">
      <div className="p-4">
        {/* <OrgSwitcher orgs={orgs} activeOrgId={activeOrgId} /> */}
        <div className="mb-6 text-muted-foreground">OrgSwitcher coming soon</div>
      </div>
      <div className="px-4">
        {/* <ProfileCard profile={profile} /> */}
        <div className="mb-6 text-muted-foreground">ProfileCard coming soon</div>
      </div>
      <nav className="flex-1 px-2">
        {/* <AppNav activeOrgId={activeOrgId} /> */}
        <div className="text-muted-foreground">AppNav coming soon</div>
      </nav>
    </aside>
  );
}

export default Sidebar;
