"use client";

import React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
};

export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={`w-[140px] h-9 rounded-lg border px-3 bg-card text-sm font-medium ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export default Select;
