"use client";

import React from "react";

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "active" | "upcoming" | "ended" | "default";
};

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  const base = "flex items-center gap-2 rounded-2xl px-3 py-1.5 text-sm font-medium";
  const variants: Record<string, string> = {
    active: "bg-chart-2/10 text-chart-2",
    upcoming: "bg-chart-3/10 text-chart-3",
    ended: "bg-destructive/20 text-destructive",
    default: "bg-[#F5F5F5] text-muted-foreground",
  };
  const classes = `${base} ${variants[variant] ?? variants.default} ${className}`;
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export default Badge;
