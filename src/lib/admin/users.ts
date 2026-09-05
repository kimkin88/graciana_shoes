import { createServiceClient } from "@/lib/supabase/service";

export type AdminUserStatus = "active" | "unverified" | "banned" | "disabled";

export type AdminUserRow = {
  id: string;
  email: string | null;
  role: "customer" | "admin";
  createdAt: string;
  status: AdminUserStatus;
  emailConfirmed: boolean;
  lastSignInAt: string | null;
  orderCount: number;
  phone: string | null;
};

type ProfileRow = {
  id: string;
  email: string | null;
  role: string;
  created_at: string;
};

function deriveStatus(input: {
  bannedUntil: string | null | undefined;
  emailConfirmedAt: string | null | undefined;
  disabled?: boolean;
}): AdminUserStatus {
  if (input.disabled) return "disabled";
  if (input.bannedUntil && new Date(input.bannedUntil).getTime() > Date.now()) return "banned";
  if (!input.emailConfirmedAt) return "unverified";
  return "active";
}

/** Load store profiles merged with auth metadata and order counts (service role). */
export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const service = createServiceClient();

  const [{ data: profiles, error: profilesError }, ordersRes, authRes] = await Promise.all([
    service.from("profiles").select("id, email, role, created_at").order("created_at", { ascending: false }),
    service.from("orders").select("user_id"),
    service.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  if (profilesError) {
    console.error("[listAdminUsers:profiles]", profilesError);
  }
  if (ordersRes.error) {
    console.error("[listAdminUsers:orders]", ordersRes.error);
  }
  if (authRes.error) {
    console.error("[listAdminUsers:auth]", authRes.error);
  }

  const orderCounts = new Map<string, number>();
  for (const row of ordersRes.data ?? []) {
    const uid = (row as { user_id: string | null }).user_id;
    if (!uid) continue;
    orderCounts.set(uid, (orderCounts.get(uid) ?? 0) + 1);
  }

  const authById = new Map(
    (authRes.data?.users ?? []).map((user) => [
      user.id,
      {
        email: user.email ?? null,
        emailConfirmedAt: user.email_confirmed_at ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
        bannedUntil: (user as { banned_until?: string | null }).banned_until ?? null,
        phone: user.phone ?? null,
        createdAt: user.created_at,
        disabled: Boolean((user as { deleted_at?: string | null }).deleted_at),
      },
    ]),
  );

  const rows = (profiles as ProfileRow[] | null) ?? [];
  const seen = new Set(rows.map((row) => row.id));

  const fromProfiles: AdminUserRow[] = rows.map((profile) => {
    const auth = authById.get(profile.id);
    const role = profile.role === "admin" ? "admin" : "customer";
    return {
      id: profile.id,
      email: profile.email ?? auth?.email ?? null,
      role,
      createdAt: profile.created_at,
      status: deriveStatus({
        bannedUntil: auth?.bannedUntil,
        emailConfirmedAt: auth?.emailConfirmedAt,
        disabled: auth?.disabled,
      }),
      emailConfirmed: Boolean(auth?.emailConfirmedAt),
      lastSignInAt: auth?.lastSignInAt ?? null,
      orderCount: orderCounts.get(profile.id) ?? 0,
      phone: auth?.phone ?? null,
    };
  });

  const authOnly: AdminUserRow[] = [];
  for (const [id, auth] of authById) {
    if (seen.has(id)) continue;
    authOnly.push({
      id,
      email: auth.email,
      role: "customer",
      createdAt: auth.createdAt,
      status: deriveStatus({
        bannedUntil: auth.bannedUntil,
        emailConfirmedAt: auth.emailConfirmedAt,
        disabled: auth.disabled,
      }),
      emailConfirmed: Boolean(auth.emailConfirmedAt),
      lastSignInAt: auth.lastSignInAt,
      orderCount: orderCounts.get(id) ?? 0,
      phone: auth.phone,
    });
  }

  return [...fromProfiles, ...authOnly].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
