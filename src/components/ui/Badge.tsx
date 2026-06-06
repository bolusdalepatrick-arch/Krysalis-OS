import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "ok" | "warn" | "err" | "info" | "default";
}

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  let baseClass = "pill ";
  
  if (variant === "ok") baseClass += "pill-ok ";
  else if (variant === "warn") baseClass += "pill-warn ";
  else if (variant === "err") baseClass += "pill-err ";
  else if (variant === "info") baseClass += "pill-info ";

  return (
    <span className={`${baseClass} ${className}`} {...props}>
      {children}
    </span>
  );
}
