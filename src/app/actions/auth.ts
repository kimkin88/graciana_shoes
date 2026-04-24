"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isLocale, type Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routing";

function readLocale(formData: FormData): Locale {
  const raw = String(formData.get("locale") ?? "ru");
  return isLocale(raw) ? raw : "ru";
}

export async function login(formData: FormData) {
  const locale = readLocale(formData);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`${localizedPath("/login", locale)}?error=1`);
  }
  revalidatePath(`/${locale}`, "layout");
  redirect(localizedPath("/", locale));
}

export async function register(formData: FormData) {
  const locale = readLocale(formData);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/${locale}`,
    },
  });
  if (error) {
    redirect(`${localizedPath("/register", locale)}?error=1`);
  }
  redirect(`${localizedPath("/login", locale)}?registered=1`);
}

export async function logout(formData: FormData) {
  const locale = readLocale(formData);
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath(`/${locale}`, "layout");
  redirect(localizedPath("/", locale));
}
