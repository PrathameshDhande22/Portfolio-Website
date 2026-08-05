"use client";

import { archivo, interTight } from "@/lib/fonts";
import { ErrorView } from "@/features/shared/components/error-view";
import { cn } from "@/lib/utils";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={cn(archivo.variable, interTight.variable)}>
      <body className="bg-paper font-text text-ink antialiased">
        <ErrorView
          title="Error"
          description="The application could not be loaded."
          error={error}
          reset={reset}
        />
      </body>
    </html>
  );
}
