"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

type Org = { id: string; name: string };

export default function InviteMemberForm({
  orgs,
  adminOrgIds,
}: {
  orgs: Org[];
  adminOrgIds: string[];
}) {
  // Compute intersection of orgs and adminOrgIds
  const selectableOrgs = orgs.filter((org) => adminOrgIds.includes(org.id));
  const [selectedOrgId] = selectableOrgs.length > 0 ? [selectableOrgs[0].id] : [""];
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"admin" | "member">("member");
  const [loading, setLoading] = React.useState(false);
  const [inviteUrl, setInviteUrl] = React.useState<string | null>(null);

  if (selectableOrgs.length === 0) {
    return null;
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInviteUrl(null);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: selectedOrgId,
          email,
          role,
        }),
      });
      const data = await res.json();
      if (res.ok && data.joinUrl) {
        setInviteUrl(data.joinUrl);
        setEmail("");
        toast.success("Invite created!");
      } else {
        toast.error(data.error || "Failed to create invite");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleInvite} className="space-y-2">
      <div>
        <label className="block text-sm font-medium mb-1">Invite by email</label>
        <Input
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value as "admin" | "member")}
          aria-label="Invite role"
        >
          <SelectItem value="member">Member</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </Select>
      </div>
      <Button type="submit" disabled={loading || !email}>
        {loading ? "Inviting..." : "Send Invite"}
      </Button>
      {inviteUrl && (
        <div className="mt-2 text-sm">
          <span className="font-medium">Invite link:</span>{" "}
          <a href={inviteUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
            {inviteUrl}
          </a>
        </div>
      )}
    </form>
  );
}
