// === START FILE: src/components/ui/Skeleton.jsx ===
import React from 'react';

/**
 * A professional loading placeholder (Shimmer Effect).
 * Usage: <Skeleton className="h-4 w-32" />
 */
export default function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-gray-700/50 rounded ${className}`} />
  );
}
// === END FILE: src/components/ui/Skeleton.jsx ===
