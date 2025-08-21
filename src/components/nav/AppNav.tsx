"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Building, User } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export default function AppNav({
  activeOrgId,
}: {
  activeOrgId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Define menu items
  const items: NavItem[] = [
    {
      href: `/app/${activeOrgId}/org`,
      label: "My Organisation",
      icon: <Building className="w-4 h-4 mr-2" />,
    },
    {
      href: `/app/profile`,
      label: "Profile",
      icon: <User className="w-4 h-4 mr-2" />,
    },
    // Add more items here as needed
  ];

  return (
    <nav aria-label="Sidebar Navigation" className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Button
            key={item.href}
            variant={isActive ? "default" : "ghost"}
            className="justify-start w-full"
            aria-current={isActive ? "page" : undefined}
            onClick={() => router.push(item.href)}
            tabIndex={0}
          >
            {item.icon}
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}
