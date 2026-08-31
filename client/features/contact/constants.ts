export const MAX_MESSAGE = 1000;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const SENT_WINDOW_MS = 24 * 60 * 60 * 1000;
export const SENT_STORAGE_KEY = "portfolio:contact-sent";
export const SENT_COOKIE = "portfolio_contact_sent";

export interface ContactInput {
  Name: string;
  Email: string;
  Subject?: string;
  Message: string;
  company?: string;
}

export interface ContactFormState {
  status: "success" | "error";
  message: string;
}
