import { SkeletonCard } from "@/components/ui/base";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-56 animate-pulse rounded bg-line-3" />
      <div className="grid gap-5 lg:grid-cols-[1.35fr_2fr]">
        <SkeletonCard className="h-40" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
      </div>
      <SkeletonCard className="h-48" />
    </div>
  );
}
