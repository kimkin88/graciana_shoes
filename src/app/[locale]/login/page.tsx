import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { PageShell } from "@/components/layout/PageShell";
import { LoginForm } from "@/components/auth/LoginForm";

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
  const err = sp.error === "1" || sp.error === "admin";
  const registered = sp.registered === "1";
  const next = typeof sp.next === "string" ? sp.next : "";

  return (
    <PageShell width="narrow">
      <LoginForm
        locale={locale}
        next={next || undefined}
        err={err}
        registered={registered}
        labels={{
          title: dict.auth.loginTitle,
          hint: dict.auth.adminAutoHint,
          email: dict.auth.email,
          password: dict.auth.password,
          submit: dict.auth.submitLogin,
          needAccount: dict.auth.needAccount,
          error: dict.auth.error,
          registeredOk:
            locale === "ru"
              ? "Аккаунт создан. Войдите, чтобы продолжить."
              : "Account created. Sign in to continue.",
        }}
      />
    </PageShell>
  );
}
