import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="animate-in fade-in h-[calc(100vh-8rem)]">
      <div className="flex h-full gap-4">
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div>
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}
