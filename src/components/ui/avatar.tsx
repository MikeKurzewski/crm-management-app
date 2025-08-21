/**
 * Placeholder for shadcn/ui Avatar component.
 * Replace with actual shadcn/ui Avatar implementation.
 */
import * as React from "react";

export function Avatar({
  src,
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-10 h-10 rounded-full object-cover bg-gray-200"
      {...props}
    />
  );
}
