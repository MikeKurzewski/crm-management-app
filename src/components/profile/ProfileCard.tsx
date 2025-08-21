"use client";

import React from "react";
// import { Avatar } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";

export function ProfileCard({
  profile,
  onEdit,
}: {
  profile: { full_name?: string; avatar_url?: string };
  onEdit: () => void;
}) {
  // Placeholder: show avatar, full name, and Edit profile button
  return (
    <div className="flex items-center gap-3 p-2 rounded-md bg-muted">
      {/* <Avatar ... /> */}
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold text-primary">
        {/* Initials or icon */}
        <span>U</span>
      </div>
      <div className="flex-1">
        <div className="font-medium">{profile.full_name || "User"}</div>
        {/* <Button onClick={onEdit} size="sm" variant="outline">Edit profile</Button> */}
        <div className="text-xs text-muted-foreground mt-1">Edit profile button coming soon</div>
      </div>
    </div>
  );
}

export default ProfileCard;
