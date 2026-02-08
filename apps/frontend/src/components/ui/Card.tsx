"use client";

import React from "react";

type PolymorphicProps<E extends React.ElementType> = {
  as?: E;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<E>, "as" | "className" | "children">;

export function Card<E extends React.ElementType = "div">({
  as,
  className = "",
  children,
  ...props
}: PolymorphicProps<E>) {
  const Component = (as || "div") as React.ElementType;
  const classes = `rounded-xl border bg-card p-5 flex flex-col gap-4 transition-all duration-200 ${className}`;
  return (
    // @ts-expect-error spreading polymorphic props onto Component
    <Component className={classes} {...(props as any)}>
      {children}
    </Component>
  );
}

export default Card;
