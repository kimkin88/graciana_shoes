import { notFound } from "next/navigation";
import { InfoPage } from "@/components/content/InfoPage";
import { isLocale } from "@/i18n/config";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return <InfoPage page="delivery" />;
}
