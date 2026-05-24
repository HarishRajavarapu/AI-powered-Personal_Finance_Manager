import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="glass-card rounded-lg p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-5 h-8 w-36" />
          <Skeleton className="mt-4 h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

