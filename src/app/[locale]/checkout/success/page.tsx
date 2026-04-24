import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { ClearCartOnSuccess } from "@/components/checkout/ClearCartOnSuccess";

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);

  return (
    <div style={{ maxWidth: 520 }}>
      <ClearCartOnSuccess />
      <h1>{dict.checkout.successTitle}</h1>
      <p style={{ lineHeight: 1.6 }}>{dict.checkout.successBody}</p>
      <Link href={localizedPath("/", locale)}>{dict.checkout.backHome}</Link>
    </div>
  );
}
