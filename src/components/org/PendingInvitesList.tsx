"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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

  const handleCancel = async (token: string) => {
    try {
      const res = await fetch(`/api/orgs/${orgId}/invites`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        toast.success("Invite cancelled");
        fetchInvites();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to cancel invite");
      }
    } catch {
      toast.error("Network error");
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
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Pending organization invites</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              : invites.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No pending invites.
                    </TableCell>
                  </TableRow>
                ) : (
                  invites.map((invite) => (
                    <TableRow key={invite.token}>
                      <TableCell>{invite.email}</TableCell>
                      <TableCell>
                        <Badge variant={invite.role === "admin" ? "default" : "secondary"}>
                          {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invite.created_at ? new Date(invite.created_at).toLocaleString() : ""}
                      </TableCell>
                      <TableCell>
                        {invite.expires_at ? new Date(invite.expires_at).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              aria-label={`Invite actions for ${invite.email}`}
                            >
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCopy(invite.joinUrl)}>
                              Copy invite link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleCancel(invite.token)}
                              className="text-red-600"
                            >
                              Cancel invite
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
