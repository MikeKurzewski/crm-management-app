"use client";

import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";


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
    if (!initial || initial.length === 0) {
      fetchMembers();
    }
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
        <Table>
          <TableCaption>Organization members and their roles</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              : members.map((m) => {
                  const isSelf = m.user_id === currentUserId;
                  const isOnlyAdmin = isSelf && m.role === "admin" && adminCount === 1;
                  return (
                    <TableRow key={m.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar src={m.avatar_url} alt={m.display_name} />
                          {m.display_name}
                        </div>
                      </TableCell>
                      <TableCell>{m.email}</TableCell>
                      <TableCell>
                        {isAdmin ? (
                          <Select
                            value={m.role}
                            onValueChange={(value) =>
                              handleRoleChange(m.user_id, value as "admin" | "member")
                            }
                            disabled={isOnlyAdmin}
                          >
<SelectTrigger aria-label={`Change role for ${m.display_name}`} className="w-[160px]">
  <SelectValue>{m.role.charAt(0).toUpperCase() + m.role.slice(1)}</SelectValue>
</SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                <Badge variant="default" className="mr-2">Admin</Badge>
                              </SelectItem>
                              <SelectItem value="member">
                                <Badge variant="secondary" className="mr-2">Member</Badge>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={m.role === "admin" ? "default" : "secondary"}>
                            {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                          </Badge>
                        )}
                        {isOnlyAdmin && (
                          <span className="text-xs text-red-500 ml-2">(last admin)</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>

     
    </div>
  );
}
