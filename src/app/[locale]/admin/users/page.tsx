import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { listAdminUsers } from "@/lib/admin/users";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import {
  AdminSectionHead,
  AdminSectionTitle,
  AdminTable,
  AdminTableWrap,
} from "@/components/admin/AdminButtons";
import { TableScroll } from "@/components/ui/ScrollArea";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const sp = await searchParams;
  const dict = await getDictionary(locale);
  const supabase = await createClient();
  const [{ data: auth }, users] = await Promise.all([supabase.auth.getUser(), listAdminUsers()]);

  const errorMessage =
    sp.error === "self"
      ? dict.admin.usersSelfError
      : sp.error
        ? dict.admin.usersSaveError
        : null;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <AdminSectionHead>
        <div style={{ display: "grid", gap: 6 }}>
          <AdminSectionTitle>{dict.admin.users}</AdminSectionTitle>
          <p style={{ margin: 0, color: "var(--page-text-muted)" }}>{dict.admin.usersHint}</p>
        </div>
      </AdminSectionHead>
      {sp.saved ? <p style={{ margin: 0 }}>{dict.admin.usersSaved}</p> : null}
      {errorMessage ? (
        <p style={{ margin: 0, color: "var(--page-danger, #b42318)" }}>{errorMessage}</p>
      ) : null}
      <AdminTableWrap>
        <TableScroll>
          <AdminTable>
            <thead>
              <tr>
                <th>{dict.admin.customer}</th>
                <th>{dict.admin.usersRole}</th>
                <th>{dict.admin.usersStatus}</th>
                <th>{dict.admin.usersPhone}</th>
                <th>{dict.admin.usersCreated}</th>
                <th>{dict.admin.usersLastSignIn}</th>
                <th>{dict.admin.usersOrders}</th>
                <th>{dict.admin.usersActions}</th>
              </tr>
            </thead>
            <AdminUsersTable
              locale={locale}
              users={users}
              currentUserId={auth.user?.id ?? null}
              labels={{
                email: dict.admin.customer,
                role: dict.admin.usersRole,
                status: dict.admin.usersStatus,
                created: dict.admin.usersCreated,
                lastSignIn: dict.admin.usersLastSignIn,
                orders: dict.admin.usersOrders,
                phone: dict.admin.usersPhone,
                makeAdmin: dict.admin.usersMakeAdmin,
                makeCustomer: dict.admin.usersMakeCustomer,
                statusActive: dict.admin.usersStatusActive,
                statusUnverified: dict.admin.usersStatusUnverified,
                statusBanned: dict.admin.usersStatusBanned,
                statusDisabled: dict.admin.usersStatusDisabled,
                roleAdmin: dict.admin.usersRoleAdmin,
                roleCustomer: dict.admin.usersRoleCustomer,
                never: dict.admin.usersNever,
              }}
            />
          </AdminTable>
        </TableScroll>
      </AdminTableWrap>
    </div>
  );
}
