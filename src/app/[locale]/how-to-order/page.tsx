import { notFound } from "next/navigation";
import { InfoPage } from "@/components/content/InfoPage";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function HowToOrderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  return <InfoPage title={dict.info.howToOrderTitle} body={dict.info.howToOrderBody} dict={dict} />;
}
