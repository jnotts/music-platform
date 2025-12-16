import { Resend } from "resend";

export function createResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set in environment variables");
  }

  return new Resend(apiKey);
}
