"use client";

import Link from "next/link";
import styled from "styled-components";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, Input, Label } from "@/components/ui/Input";
import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";

const Wrap = styled.div`
  max-width: 400px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
`;

const AuthSubmitButton = styled(Button)`
  min-width: 140px;
`;

const Hint = styled.p`
  margin: 0;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.5;
`;

type Props = {
  locale: Locale;
  next?: string;
  err?: boolean;
  registered?: boolean;
  labels: {
    title: string;
    hint: string;
    email: string;
    password: string;
    submit: string;
    needAccount: string;
    error: string;
    registeredOk: string;
  };
};

/** Client login form so styled-components receive the theme provider. */
export function LoginForm({ locale, next, err, registered, labels }: Props) {
  return (
    <Wrap>
      <h1 style={{ margin: 0 }}>{labels.title}</h1>
      <Hint>{labels.hint}</Hint>

      {registered ? <p style={{ margin: 0, color: "#15803d" }}>{labels.registeredOk}</p> : null}
      {err ? <p style={{ margin: 0, color: "#b91c1c" }}>{labels.error}</p> : null}

      <form action={login} style={{ display: "grid", gap: 4 }}>
        <input type="hidden" name="locale" value={locale} />
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <Field>
          <Label htmlFor="email">{labels.email}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </Field>
        <Field>
          <Label htmlFor="password">{labels.password}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </Field>
        <AuthSubmitButton type="submit">{labels.submit}</AuthSubmitButton>
      </form>

      <p style={{ margin: 0 }}>
        <Link href={localizedPath("/register", locale)}>{labels.needAccount}</Link>
      </p>
    </Wrap>
  );
}
