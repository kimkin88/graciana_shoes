import { redirect } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";

export default async function LegacyConstructorRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "ru";
  redirect(localizedPath("/admin/content", locale));
}
