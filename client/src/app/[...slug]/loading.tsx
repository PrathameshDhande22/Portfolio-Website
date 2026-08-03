import { SectionSkeleton, TerminalLoader } from "@/features/shared/components/loading";

export default function PageLoading() {
  return (
    <div className="mx-auto max-w-wrap px-pad pb-[clamp(4rem,9vw,7rem)]">
      <div className="pt-[clamp(2.25rem,4.5vw,3.25rem)]">
        <TerminalLoader pending="rendering page blocks" />
      </div>
      <SectionSkeleton />
    </div>
  );
}
