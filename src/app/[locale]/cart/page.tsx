import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { CartView } from "@/components/cart/CartView";
import { OpenCartDrawer } from "@/components/cart/OpenCartDrawer";
import { PageShell } from "@/components/layout/PageShell";

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);

  return (
    <PageShell width="narrow">
      <OpenCartDrawer />
      <div style={{ display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3.6rem)" }}>{dict.cart.title}</h1>
        <CartView locale={locale} dict={dict} />
      </div>
    </PageShell>
  );
}
