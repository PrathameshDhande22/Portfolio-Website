export const MAX_MESSAGE = 1000;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
