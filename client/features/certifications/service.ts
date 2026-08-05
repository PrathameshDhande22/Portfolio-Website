import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAG, ENDPOINT, strapiClient } from "@/features/shared/service";
import type { Certification } from "@/types/content";

export async function getCertifications(documentIds?: string[]): Promise<Certification[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAG.certifications);

  const response = await strapiClient()
    .collection(ENDPOINT.certifications)
    .find({
      filters: documentIds?.length ? { documentId: { $in: documentIds } } : undefined,
      populate: { VerifyLink: true },
      sort: ["Issued:desc"],
      pagination: { pageSize: 100 },
    });

  return response.data as Certification[];
}
