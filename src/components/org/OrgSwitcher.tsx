"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Select, SelectItem } from "@/components/ui/select";

// Helper to extract orgId from /app/[orgId] or /app/[orgId]/*
function getCurrentOrgIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/app\/([^\/]+)/);
  return match ? match[1] : null;
}

export function OrgSwitcher({
  orgs,
}: {
  orgs: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentOrgId = getCurrentOrgIdFromPath(pathname);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (selectedId && selectedId !== currentOrgId) {
      router.push(`/app/${selectedId}`);
    }
  };

  const isDisabled = orgs.length <= 1;

  return (
    <div>
      <Select
        value={currentOrgId ?? ""}
        onChange={handleChange}
        disabled={isDisabled}
        className="w-full"
        aria-label="Organization Switcher"
      >
        {orgs.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            {org.name}
          </SelectItem>
        ))}
      </Select>
      {isDisabled && (
        <div className="text-xs text-muted-foreground mt-1">Only one organization</div>
      )}
    </div>
  );
}

export default OrgSwitcher;
