import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/changelog"] },
    sitemap: `${env.siteUrl}/sitemap.xml`
  };
}
