import type { Locale } from "./config";
import type ru from "../messages/ru.json";

export type Messages = typeof ru;

export async function getDictionary(locale: Locale): Promise<Messages> {
  if (locale === "en") {
    return (await import("../messages/en.json")).default;
  }
  return (await import("../messages/ru.json")).default;
}
