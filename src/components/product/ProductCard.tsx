import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";
import { formatMoney } from "@/lib/format/money";
import { productTitle } from "@/lib/products/display";
import type { ProductRow } from "@/types";
import { ProductMediaSlider } from "@/components/product/ProductMediaSlider";

type Props = { product: ProductRow; locale: Locale };

/** Compact product tile for grids (server-rendered; links to localized PDP). */
export function ProductCard({ product, locale }: Props) {
  const title = productTitle(product, locale);
  const href = localizedPath(`/products/${product.slug}`, locale);

  return (
    <Card>
      <Link href={href} style={{ display: "block", color: "inherit" }}>
        <ProductMediaSlider imageUrl={product.image_url} videoUrl={product.video_url} alt={title} />
        <CardBody>
          <h3 style={{ margin: "0 0 8px", fontSize: "1.05rem" }}>{title}</h3>
          <p style={{ margin: 0, color: "var(--muted-price, #64748b)", fontSize: "0.9rem" }}>
            {formatMoney(product.price_cents, product.currency, locale)}
          </p>
        </CardBody>
      </Link>
    </Card>
  );
}
