"use client";

import React from "react";
// import { Form } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";

export function OrgForm({
  org,
}: {
  org: { id: string; name: string; description?: string; logo_url?: string };
}) {
  // Placeholder: implement zod schema, react-hook-form, shadcn Form
  return (
    <div>
      {/* <Form ... /> */}
      <div className="text-muted-foreground">Org edit form coming soon</div>
    </div>
  );
}

export default OrgForm;
