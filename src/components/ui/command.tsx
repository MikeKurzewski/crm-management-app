/**
 * Placeholder for shadcn/ui Command component.
 * Replace with actual shadcn/ui Command implementation.
 */
import * as React from "react";

export function Command({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="border rounded-md bg-background p-2" {...props}>
      {children}
    </div>
  );
}

export function CommandInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="w-full p-2 border-b" {...props} />;
}

export function CommandList({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className="mt-2" {...props}>{children}</ul>;
}

export function CommandItem({ children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className="cursor-pointer p-2 hover:bg-muted" {...props}>{children}</li>;
}

export function CommandGroup({ children, heading, ...props }: React.HTMLAttributes<HTMLDivElement> & { heading?: string }) {
  return (
    <div {...props}>
      {heading && <div className="text-xs font-semibold text-muted-foreground mb-1">{heading}</div>}
      <ul>{children}</ul>
    </div>
  );
}

export function CommandEmpty({ children }: { children: React.ReactNode }) {
  return <div className="text-muted-foreground p-2">{children}</div>;
}

export function CommandSeparator() {
  return <hr className="my-2 border-muted" />;
}
