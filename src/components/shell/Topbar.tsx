import React from "react";

export function Topbar() {
  return (
    <header className="flex items-center h-14 px-6 border-b bg-background">
      <div className="flex items-center gap-2">
        {/* Placeholder logo */}
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-2">
          <span className="text-lg font-bold text-primary">C</span>
        </div>
        <span className="text-xl font-semibold tracking-tight">CRM Management</span>
      </div>
      <div className="flex-1" />
      {/* Optional: future actions (right side) */}
      <div className="flex items-center gap-2">{/* Actions go here */}</div>
    </header>
  );
}

export default Topbar;
