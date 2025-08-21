"use client";

import React from "react";
import { Select, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

type Member = {
  user_id: string;
  role: "admin" | "member";
  display_name: string;
  email: string;
  avatar_url?: string;
};

export default function MembersTable({
  orgId,
  initial,
  isAdmin,
  currentUserId,
}: {
  orgId: string;
  initial: Member[];
  isAdmin: boolean;
  currentUserId: string;
}) {
  const [members, setMembers] = React.useState<Member[]>(initial);
  const [loading, setLoading] = React.useState(false);

  // Fetch latest members from API
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/members`);
      const data = await res.json();
      if (res.ok) {
        setMembers(data);
      } else {
        toast.error(data.error || "Failed to load members");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  // Count admins for self-demotion prevention
  const adminCount = members.filter((m) => m.role === "admin").length;

  const handleRoleChange = async (userId: string, newRole: "admin" | "member") => {
    const prev = members;
    setMembers((ms) =>
      ms.map((m) => (m.user_id === userId ? { ...m, role: newRole } : m))
    );
    try {
      const res = await fetch(`/api/orgs/${orgId}/members`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMembers(prev); // revert
        toast.error(data.error || "Failed to update role");
      } else {
        toast.success("Role updated");
        fetchMembers(); // refresh after change
      }
    } catch (e) {
      setMembers(prev); // revert
      toast.error("Network error");
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-semibold">Members</h2>
        <Button type="button" size="sm" variant="outline" onClick={fetchMembers} disabled={loading}>
          Refresh
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const isSelf = m.user_id === currentUserId;
              const isOnlyAdmin = isSelf && m.role === "admin" && adminCount === 1;
              return (
                <tr key={m.user_id} className="border-t">
                  <td className="p-2 flex items-center gap-2">
                    <Avatar src={m.avatar_url} alt={m.display_name} />
                    {m.display_name}
                  </td>
                  <td className="p-2">{m.email}</td>
                  <td className="p-2">
                    {isAdmin ? (
                      <Select
                        value={m.role}
                        onChange={(e) =>
                          handleRoleChange(m.user_id, e.target.value as "admin" | "member")
                        }
                        disabled={isOnlyAdmin}
                        aria-label={`Change role for ${m.display_name}`}
                      >
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </Select>
                    ) : (
                      <span>{m.role}</span>
                    )}
                    {isOnlyAdmin && (
                      <span className="text-xs text-red-500 ml-2">(last admin)</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
