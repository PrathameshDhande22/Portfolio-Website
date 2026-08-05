import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { CACHE_TAG } from "@/features/shared/service";
import { env } from "@/lib/env";

export function POST(request: NextRequest) {
  if (request.headers.get("x-revalidate-secret") !== env.revalidateSecret) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }

  const tags = Object.values(CACHE_TAG);
  for (const tag of tags) revalidateTag(tag, "max");

  return NextResponse.json({ revalidated: true, tags });
}
