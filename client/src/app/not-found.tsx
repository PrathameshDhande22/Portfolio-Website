import type { Metadata } from "next";
import { NotFoundView } from "@/features/shared/components/not-found-view";

export const metadata: Metadata = {
  title: "404 - Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView />;
}
