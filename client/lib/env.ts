function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value;
}

export const env = {
  get strapiUrl() {
    return required("BASE_URL");
  },
  get strapiToken() {
    return required("API_TOKEN");
  },
  get siteUrl() {
    return process.env.SITE_URL ?? "http://localhost:3000";
  },
  get githubToken() {
    return process.env.GITHUB_TOKEN;
  },
  get revalidateSecret() {
    return required("REVALIDATE_SECRET");
  },
};
