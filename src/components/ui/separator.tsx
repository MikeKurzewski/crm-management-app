/**
 * Placeholder for shadcn/ui Separator component.
 * Replace with actual shadcn/ui Separator implementation.
 */
import * as React from "react";

export function Separator({ className = "", ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={`border-t border-muted ${className}`} {...props} />;
}
