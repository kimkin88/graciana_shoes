import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";

type Props = {
  locale: Locale;
  dict: Messages;
};

export function SiteFooter({ locale, dict }: Props) {
  const mk = (path: string) => localizedPath(path, locale);
  return (
    <footer
      style={{
        borderTop: "1px solid #cbd5e1",
        marginTop: 24,
        fontSize: 14,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "20px 12px 30px",
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <div>
          <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 20 }}>{dict.info.brand}</h3>
          <p style={{ margin: "6px 0", color: "#64748b", fontSize: 13 }}>{dict.info.tagline}</p>
          <p style={{ margin: "6px 0", fontSize: 13 }}>{dict.info.phones.join(" / ")}</p>
          <p style={{ margin: "6px 0", fontSize: 13 }}>{dict.info.email}</p>
        </div>
        <div>
          <h4 style={{ marginTop: 0, marginBottom: 10, fontSize: 15 }}>{dict.info.customerTitle}</h4>
          <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
            <Link href={mk("/delivery-payment")}>{dict.nav.delivery}</Link>
            <Link href={mk("/returns-exchange")}>{dict.nav.returns}</Link>
            <Link href={mk("/how-to-order")}>{dict.nav.howToOrder}</Link>
            <Link href={mk("/installment")}>{dict.nav.installment}</Link>
            <Link href={mk("/promotions")}>{dict.nav.promotions}</Link>
          </div>
        </div>
        <div>
          <h4 style={{ marginTop: 0, marginBottom: 10, fontSize: 15 }}>{dict.info.contactsTitle}</h4>
          <p style={{ margin: "6px 0", whiteSpace: "pre-wrap", fontSize: 13 }}>{dict.info.address}</p>
          <p style={{ margin: "6px 0", color: "#64748b", fontSize: 13 }}>{dict.info.workHours}</p>
        </div>
        <div>
          <h4 style={{ marginTop: 0, marginBottom: 10, fontSize: 15 }}>{dict.info.legalTitle}</h4>
          <p style={{ margin: "6px 0", color: "#64748b", whiteSpace: "pre-wrap", fontSize: 12.5, lineHeight: 1.5 }}>
            {dict.info.legal}
          </p>
        </div>
      </div>
    </footer>
  );
}
