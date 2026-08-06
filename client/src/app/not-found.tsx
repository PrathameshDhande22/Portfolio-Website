import { ErrorView } from "@/features/shared/components/error-view";

export default function NotFound() {
  return <ErrorView title="404" description="That page does not exist." />;
}
