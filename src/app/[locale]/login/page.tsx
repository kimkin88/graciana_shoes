import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, Input, Label } from "@/components/ui/Input";

export default async function LoginPage({
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

  return (
    <div style={{ maxWidth: 400 }}>
      <h1>{dict.auth.loginTitle}</h1>
      {err ? <p style={{ color: "#b91c1c" }}>{dict.auth.error}</p> : null}
      <form action={login} style={{ marginTop: 16 }}>
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
            autoComplete="current-password"
          />
        </Field>
        <Button type="submit">{dict.auth.submitLogin}</Button>
      </form>
      <p style={{ marginTop: 16 }}>
        <Link href={localizedPath("/register", locale)}>{dict.auth.needAccount}</Link>
      </p>
    </div>
  );
}
