import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";
import { formatMoney } from "@/lib/format/money";
import { productTitle } from "@/lib/products/display";
import type { ProductRow } from "@/types";

type Props = { product: ProductRow; locale: Locale };

/** Compact product tile for grids (server-rendered; links to localized PDP). */
export function ProductCard({ product, locale }: Props) {
  const title = productTitle(product, locale);
  const href = localizedPath(`/products/${product.slug}`, locale);

  return (
    <Card>
      <Link href={href} style={{ display: "block", color: "inherit" }}>
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt=""
            width={640}
            height={360}
            style={{
              width: "100%",
              height: 200,
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : null}
        <CardBody>
          <h3 style={{ margin: "0 0 8px", fontSize: "1.05rem" }}>{title}</h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
            {formatMoney(product.price_cents, product.currency, locale)}
          </p>
        </CardBody>
      </Link>
    </Card>
  );
}
