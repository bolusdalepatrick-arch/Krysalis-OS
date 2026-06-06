import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && <span className="absolute left-3 text-[var(--cream-dim)] pointer-events-none">{icon}</span>}
        <input
          ref={ref}
          className={`w-full bg-[rgba(0,0,0,0.25)] border border-[var(--panel-border)] rounded-lg text-sm text-[var(--cream)] placeholder:text-[var(--cream-mute)] outline-none focus:border-[var(--panel-border-hot)] focus:ring-1 focus:ring-[var(--panel-border-hot)] transition-all ${
            icon ? "pl-9 pr-3 py-2" : "px-3 py-2"
          } ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
