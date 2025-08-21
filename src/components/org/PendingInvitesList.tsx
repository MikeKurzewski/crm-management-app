"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Invite = {
  token: string;
  email: string;
  role: "admin" | "member";
  created_at: string;
  expires_at: string | null;
  joinUrl: string;
};

export default function PendingInvitesList({ orgId }: { orgId: string }) {
  const [invites, setInvites] = React.useState<Invite[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/invites`);
      const data = await res.json();
      if (res.ok) {
        setInvites(data);
      } else {
        toast.error(data.error || "Failed to load invites");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Invite link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-semibold">Pending Invites</h2>
        <Button type="button" size="sm" variant="outline" onClick={fetchInvites} disabled={loading}>
          Refresh
        </Button>
      </div>
      {loading ? (
        <div className="text-muted-foreground">Loading invites...</div>
      ) : invites.length === 0 ? (
        <div className="text-muted-foreground">No pending invites.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Created</th>
                <th className="p-2 text-left">Expires</th>
                <th className="p-2 text-left">Link</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => (
                <tr key={invite.token} className="border-t">
                  <td className="p-2">{invite.email}</td>
                  <td className="p-2">{invite.role}</td>
                  <td className="p-2">{invite.created_at ? new Date(invite.created_at).toLocaleString() : ""}</td>
                  <td className="p-2">{invite.expires_at ? new Date(invite.expires_at).toLocaleString() : "—"}</td>
                  <td className="p-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(invite.joinUrl)}
                      aria-label={`Copy invite link for ${invite.email}`}
                    >
                      Copy
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
