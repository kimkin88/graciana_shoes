/**
 * Optional transactional email via Resend REST API (no extra npm dependency).
 * If RESEND_API_KEY is unset, this is a no-op — safe for local dev.
 */

type Line = { quantity: number; unit_price_cents: number; name: string };

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(params: {
  locale: "ru" | "en";
  orderId: string;
  totalCents: number;
  currency: string;
  lines: Line[];
}) {
  const { locale, orderId, totalCents, currency, lines } = params;
  const isRu = locale === "ru";
  const title = isRu ? "Заказ оплачен" : "Order paid";
  const intro = isRu
    ? "Спасибо за покупку. Краткое содержание заказа:"
    : "Thank you for your purchase. Order summary:";
  const rows = lines
    .map(
      (l) =>
        `<tr><td>${escapeHtml(l.name)}</td><td style="text-align:right">${l.quantity}×</td><td style="text-align:right">${(l.unit_price_cents * l.quantity) / 100} ${currency.toUpperCase()}</td></tr>`,
    )
    .join("");
  const total = (totalCents / 100).toFixed(2);
  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5">
  <h1 style="font-size:1.25rem">${title}</h1>
  <p>${intro}</p>
  <p style="font-size:0.85rem;color:#555">ID: <code>${escapeHtml(orderId)}</code></p>
  <table style="border-collapse:collapse;width:100%;max-width:480px">${rows}</table>
  <p style="margin-top:16px;font-weight:600">${isRu ? "Итого" : "Total"}: ${total} ${currency.toUpperCase()}</p>
  </body></html>`;
}

export async function sendOrderConfirmationEmail(params: {
  to: string | null | undefined;
  locale: string;
  orderId: string;
  totalCents: number;
  currency: string;
  lines: Line[];
}) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  if (!key || !from || !params.to) return;

  const locale = params.locale === "en" ? "en" : "ru";
  const subject =
    locale === "ru"
      ? `Заказ ${params.orderId.slice(0, 8)} — оплачен`
      : `Order ${params.orderId.slice(0, 8)} — paid`;

  const html = buildHtml({
    locale,
    orderId: params.orderId,
    totalCents: params.totalCents,
    currency: params.currency,
    lines: params.lines,
  });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Resend email failed", res.status, text);
  }
}
