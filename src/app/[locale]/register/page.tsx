import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/routing";
import { register } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, Input, Label } from "@/components/ui/Input";
import styled from "styled-components";

const AuthSubmitButton = styled(Button)`
  min-width: 140px;
`;

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
    <div style={{ maxWidth: 400 }}>
      <h1>{dict.auth.registerTitle}</h1>
      {ok ? (
        <p style={{ color: "#15803d" }}>
          {locale === "ru"
            ? "Проверьте почту для подтверждения (если включено в Supabase)."
            : "Check your email to confirm your account (if enabled in Supabase)."}
        </p>
      ) : null}
      {err ? <p style={{ color: "#b91c1c" }}>{dict.auth.error}</p> : null}
      <form action={register} style={{ marginTop: 16 }}>
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
        <AuthSubmitButton type="submit">{dict.auth.submitRegister}</AuthSubmitButton>
      </form>
      <p style={{ marginTop: 16 }}>
        <Link href={localizedPath("/login", locale)}>{dict.auth.haveAccount}</Link>
      </p>
    </div>
  );
}
