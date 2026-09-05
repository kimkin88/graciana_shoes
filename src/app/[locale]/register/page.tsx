import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { register } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, Input, Label } from "@/components/ui/Input";
import { PageShell } from "@/components/layout/PageShell";

export default async function RegisterPage({
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
  const err = sp.error === "1";
  const ok = sp.registered === "1";

  return (
    <PageShell width="narrow">
      <div style={{ maxWidth: 400, display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0 }}>{dict.auth.registerTitle}</h1>
        {ok ? (
          <p style={{ margin: 0, color: "#15803d" }}>
            {locale === "ru"
              ? "Проверьте почту для подтверждения (если включено в Supabase)."
              : "Check your email to confirm your account (if enabled in Supabase)."}
          </p>
        ) : null}
        {err ? <p style={{ margin: 0, color: "#b91c1c" }}>{dict.auth.error}</p> : null}
        <form action={register} style={{ display: "grid", gap: 4 }}>
          <input type="hidden" name="locale" value={locale} />
          <Field>
            <Label htmlFor="email">{dict.auth.email}</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </Field>
          <Field>
            <Label htmlFor="password">{dict.auth.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={6}
            />
          </Field>
          <Button type="submit" style={{ minWidth: 140 }}>
            {dict.auth.submitRegister}
          </Button>
        </form>
        <p style={{ margin: 0 }}>
          <Link href={localizedPath("/login", locale)}>{dict.auth.haveAccount}</Link>
        </p>
      </div>
    </PageShell>
  );
}
