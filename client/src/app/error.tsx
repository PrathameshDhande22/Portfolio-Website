"use client";

import { ErrorView } from "@/features/shared/components/error-view";

export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorView
      title="Error"
      description="Something went wrong loading this page."
      error={error}
      reset={reset}
    />
  );
}
