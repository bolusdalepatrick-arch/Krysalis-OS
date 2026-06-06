import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "copy";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
  let baseClass = "inline-flex items-center justify-center font-medium transition-all rounded-lg disabled:opacity-50 ";
  
  if (variant === "copy") {
    baseClass = "copy-btn ";
  } else {
    // Sizes
    if (size === "sm") baseClass += "px-3 py-1.5 text-xs gap-1.5 ";
    if (size === "md") baseClass += "px-4 py-2 text-sm gap-2 ";
    if (size === "lg") baseClass += "px-5 py-3 text-base gap-2 ";

    // Variants
    if (variant === "primary") {
      baseClass += "bg-[var(--accent-primary)] text-[var(--bg-deep)] border border-[var(--accent-primary)] hover:bg-[var(--accent-soft)] hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(91,181,73,0.35)] ";
    } else if (variant === "secondary") {
      baseClass += "bg-[rgba(255,255,255,0.06)] text-[var(--cream)] border border-[var(--line-soft)] hover:border-[var(--line)] hover:bg-[var(--bg-elev)] ";
    } else if (variant === "danger") {
      baseClass += "bg-[rgba(196,96,126,0.15)] text-[var(--accent-danger)] border border-[rgba(196,96,126,0.45)] hover:bg-[rgba(196,96,126,0.25)] ";
    } else if (variant === "ghost") {
      baseClass += "bg-transparent text-[var(--cream-dim)] hover:text-[var(--cream)] hover:bg-[rgba(255,255,255,0.04)] ";
    }
  }

  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
