import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { PageShell } from "@/components/layout/PageShell";

export default async function CheckoutResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "failed";
  const declined = status === "declined" || status === "cancel" || status === "cancelled";

  return (
    <PageShell width="narrow">
      <div style={{ maxWidth: 520 }}>
        <h1>{declined ? dict.checkout.declinedTitle : dict.checkout.failedTitle}</h1>
        <p style={{ lineHeight: 1.6 }}>
          {declined ? dict.checkout.declinedBody : dict.checkout.failedBody}
        </p>
        <Link href={localizedPath("/cart", locale)}>{dict.checkout.backCart}</Link>
      </div>
    </PageShell>
  );
}
