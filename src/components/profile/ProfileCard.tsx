"use client";

import React from "react";
import { useRouter } from "next/navigation";
// import { Avatar } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";

export function ProfileCard({
  profile,
}: {
  profile: { full_name?: string; avatar_url?: string };
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 p-2 rounded-md bg-muted">
      {/* <Avatar ... /> */}
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold text-primary">
        {/* Initials or icon */}
        <span>U</span>
      </div>
      <div className="flex-1">
        <div className="font-medium">{profile.full_name || "User"}</div>
        <button
          type="button"
          className="text-xs underline text-blue-600 mt-1"
          tabIndex={0}
          aria-label="Edit profile"
          onClick={() => router.push("/app/profile")}
        >
          Edit profile
        </button>
      </div>
    </div>
  );
}

export default ProfileCard;
