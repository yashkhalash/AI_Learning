"use client";

// Progress state now lives in a single ProgressProvider mounted at the root layout
// (see components/ProgressProvider.tsx) so every page shares one live snapshot
// instead of each page fetching and diverging independently. Re-exported here so
// existing `import { useProgress } from "@/lib/useProgress"` call sites don't change.
export { useProgress } from "@/components/ProgressProvider";
export type { Stats } from "@/components/ProgressProvider";
