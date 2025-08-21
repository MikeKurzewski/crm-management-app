/**
 * shadcn/ui Avatar component with safe src handling.
 */
import * as React from "react";

export function Avatar({
  src,
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  // Only render <img> if src is a non-empty string
  if (typeof src === "string" && src.trim() !== "") {
    return (
      <img
        src={src}
        alt={alt}
        className="w-10 h-10 rounded-full object-cover bg-gray-200"
        {...props}
      />
    );
  }
  // Fallback: render a default avatar (e.g., initials or icon)
  return (
    <div
      className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-primary"
      aria-label={alt || "Avatar"}
      {...props}
    >
      <span>U</span>
    </div>
  );
}
