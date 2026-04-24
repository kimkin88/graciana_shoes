import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);

  return (
    <section style={{ maxWidth: 900 }}>
      <h1 style={{ marginTop: 0 }}>{dict.info.contactsPageTitle}</h1>
      <p>{dict.info.brand}</p>
      <p>{dict.info.phones.join(" / ")}</p>
      <p>{dict.info.email}</p>
      <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{dict.info.address}</p>
      <p>{dict.info.workHours}</p>
      <p style={{ whiteSpace: "pre-wrap" }}>{dict.info.legal}</p>
    </section>
  );
}
