import { createHash, createHmac, randomUUID } from "node:crypto";
import { env } from "@/lib/env";

export interface SignedHeaders {
  "X-Timestamp": string;
  "X-Nonce": string;
  "X-Signature": string;
}

export function signRequest(method: string, path: string, body: string): SignedHeaders {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomUUID();
  const bodyHash = createHash("sha256").update(body).digest("hex");

  const canonical = [method.toUpperCase(), path, timestamp, nonce, bodyHash].join("\n");
  const digest = createHmac("sha256", env.assistantSecret).update(canonical).digest("hex");

  return {
    "X-Timestamp": timestamp,
    "X-Nonce": nonce,
    "X-Signature": `sha256=${digest}`,
  };
}
