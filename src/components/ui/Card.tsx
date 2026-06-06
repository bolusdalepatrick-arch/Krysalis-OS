import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "action" | "panel";
}

export function Card({ variant = "surface", className = "", children, ...props }: CardProps) {
  let baseClass = "";
  
  if (variant === "surface") baseClass = "surface-card";
  else if (variant === "action") baseClass = "action-card";
  else if (variant === "panel") baseClass = "panel";

  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  );
}
