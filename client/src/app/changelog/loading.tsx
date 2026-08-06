import { SectionSkeleton, TerminalLoader } from "@/features/shared/components/loading";

export default function ChangelogLoading() {
  return (
    <div className="mx-auto max-w-wrap px-pad pb-[clamp(4rem,9vw,7rem)]">
      <SectionSkeleton />
      <TerminalLoader
        trace={[{ method: "GET", path: "/api/versions", status: "200" }]}
        pending="rendering releases"
      />
    </div>
  );
}
