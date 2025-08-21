"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Select, SelectItem } from "@/components/ui/select";

export function OrgSwitcher({
  orgs,
  activeOrgId,
}: {
  orgs: Array<{ id: string; name: string }>;
  activeOrgId: string;
}) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (selectedId && selectedId !== activeOrgId) {
      router.push(`/app/${selectedId}`);
    }
  };

  const isDisabled = orgs.length <= 1;

  return (
    <div>
      <Select value={activeOrgId} onChange={handleChange} disabled={isDisabled} className="w-full">
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
