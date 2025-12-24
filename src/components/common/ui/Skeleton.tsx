"use client";

import React from "react";

export type SkeletonRounded = "none" | "sm" | "md" | "lg" | "full";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  rounded?: SkeletonRounded;
}

export default function Skeleton({
  width,
  height,
  rounded = "md",
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const roundedClasses: Record<SkeletonRounded, string> = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const sizeStyle: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    ...style,
  };

  const classNames = [
    "h-4 w-full animate-pulse bg-gray-200/80",
    roundedClasses[rounded],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div aria-hidden="true" className={classNames} style={sizeStyle} {...props} />;
}
