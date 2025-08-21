"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Check } from "lucide-react";

// Helper to extract orgId from /app/[orgId] or /app/[orgId]/*
function getCurrentOrgIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/app\/([^\/]+)/);
  return match ? match[1] : null;
}

export function OrgSwitcher({
  orgs,
}: {
  orgs: Array<{ id: string; name: string; logoUrl?: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentOrgId = getCurrentOrgIdFromPath(pathname);

  const [open, setOpen] = React.useState(false);

  const currentOrg = orgs.find((org) => org.id === currentOrgId);

  const handleSelect = (orgId: string) => {
    setOpen(false);
    if (orgId && orgId !== currentOrgId) {
      router.push(`/app/${orgId}`);
    }
  };

  const isDisabled = orgs.length <= 1;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          aria-label="Organization Switcher"
          disabled={isDisabled}
        >
          <span className="flex items-center gap-2">
            {currentOrg?.logoUrl && (
              <Avatar src={currentOrg.logoUrl} alt={currentOrg.name} className="h-5 w-5" />
            )}
            {currentOrg?.name ?? "Select organization"}
          </span>
          <span className="ml-2 text-muted-foreground">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-64" align="start">
        <Command>
          <CommandInput placeholder="Search organization..." />
          <CommandList>
            <CommandEmpty>No organizations found.</CommandEmpty>
            {orgs.map((org) => (
              <CommandItem
                key={org.id}
                value={org.id}
                onSelect={() => handleSelect(org.id)}
                className="flex items-center gap-2"
              >
                {org.logoUrl && (
                  <Avatar src={org.logoUrl} alt={org.name} className="h-5 w-5" />
                )}
                <span className="flex-1">{org.name}</span>
                {org.id === currentOrgId && (
                  <Check className="ml-auto h-4 w-4 text-primary" />
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
        {isDisabled && (
          <div className="text-xs text-muted-foreground mt-2 px-2 pb-2">Only one organization</div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default OrgSwitcher;
