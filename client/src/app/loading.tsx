import { Skeleton } from "@/components/ui/skeleton";
import { TerminalLoader } from "@/features/shared/components/loading";

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-wrap px-pad">
      <div className="grid grid-cols-1 gap-3.5 py-[clamp(1.5rem,3vw,2.25rem)] tile:grid-cols-2 wide:grid-cols-4">
        <div className="tile:col-span-2 wide:col-span-4">
          <TerminalLoader pending="building the intro tile" />
        </div>
        <Skeleton className="h-80 rounded-[18px] tile:col-span-2 wide:col-span-2" />
        <Skeleton className="h-55 rounded-[18px] tile:col-span-2 wide:col-span-2" />
      </div>
    </div>
  );
}
