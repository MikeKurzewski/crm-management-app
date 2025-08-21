"use client";

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

type Org = { id: string; name: string };

const inviteSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "member"]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

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
  const [inviteUrl, setInviteUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  if (selectableOrgs.length === 0) {
    return null;
  }

  const handleInvite = async (values: InviteFormValues) => {
    setLoading(true);
    setInviteUrl(null);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: selectedOrgId,
          email: values.email,
          role: values.role,
        }),
      });
      const data = await res.json();
      if (res.ok && data.joinUrl) {
        setInviteUrl(data.joinUrl);
        form.reset({ email: "", role: "member" });
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleInvite)}
        className="space-y-4"
        autoComplete="off"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invite by email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  autoComplete="off"
                  {...field}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger aria-label="Invite role">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading || !form.formState.isValid}>
          {loading ? "Inviting..." : "Send Invite"}
        </Button>
        {inviteUrl && (
          <div className="mt-2 text-sm">
            <span className="font-medium">Invite link:</span>{" "}
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600"
            >
              {inviteUrl}
            </a>
          </div>
        )}
      </form>
    </Form>
  );
}
