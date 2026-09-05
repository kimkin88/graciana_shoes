"use client";

import styled from "styled-components";
import type { Locale } from "@/i18n/config";
import type { AdminUserRow, AdminUserStatus } from "@/lib/admin/users";
import { AdminButton } from "@/components/admin/AdminButtons";
import { updateUserRole } from "@/app/actions/admin-users";

const Status = styled.span<{ $tone: AdminUserStatus }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid currentColor;
  color: ${({ $tone, theme }) =>
    $tone === "active"
      ? theme.colors.text
      : $tone === "unverified"
        ? theme.colors.textMuted
        : theme.colors.danger};
`;

const Role = styled.span<{ $admin?: boolean }>`
  display: inline-flex;
  padding: 4px 8px;
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: ${({ $admin, theme }) => ($admin ? theme.colors.text : "transparent")};
  color: ${({ $admin, theme }) => ($admin ? theme.colors.background : theme.colors.textMuted)};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

type Labels = {
  email: string;
  role: string;
  status: string;
  created: string;
  lastSignIn: string;
  orders: string;
  phone: string;
  makeAdmin: string;
  makeCustomer: string;
  statusActive: string;
  statusUnverified: string;
  statusBanned: string;
  statusDisabled: string;
  roleAdmin: string;
  roleCustomer: string;
  never: string;
};

type Props = {
  locale: Locale;
  users: AdminUserRow[];
  labels: Labels;
  currentUserId: string | null;
};

function statusLabel(status: AdminUserStatus, labels: Labels) {
  if (status === "active") return labels.statusActive;
  if (status === "unverified") return labels.statusUnverified;
  if (status === "banned") return labels.statusBanned;
  return labels.statusDisabled;
}

export function AdminUsersTable({ locale, users, labels, currentUserId }: Props) {
  const dateLocale = locale === "ru" ? "ru-RU" : "en-US";

  return (
    <tbody>
      {users.map((user) => {
        const nextRole = user.role === "admin" ? "customer" : "admin";
        const canToggle = user.id !== currentUserId || user.role !== "admin";
        return (
          <tr key={user.id}>
            <td>
              <div style={{ display: "grid", gap: 4 }}>
                <strong>{user.email ?? "—"}</strong>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.72rem", opacity: 0.7 }}>
                  {user.id}
                </span>
              </div>
            </td>
            <td>
              <Role $admin={user.role === "admin"}>
                {user.role === "admin" ? labels.roleAdmin : labels.roleCustomer}
              </Role>
            </td>
            <td>
              <Status $tone={user.status}>{statusLabel(user.status, labels)}</Status>
            </td>
            <td>{user.phone || "—"}</td>
            <td>{new Date(user.createdAt).toLocaleString(dateLocale)}</td>
            <td>
              {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString(dateLocale) : labels.never}
            </td>
            <td>{user.orderCount}</td>
            <td>
              {canToggle ? (
                <form action={updateUserRole}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="user_id" value={user.id} />
                  <input type="hidden" name="email" value={user.email ?? ""} />
                  <input type="hidden" name="role" value={nextRole} />
                  <AdminButton type="submit" $variant="ghost">
                    {nextRole === "admin" ? labels.makeAdmin : labels.makeCustomer}
                  </AdminButton>
                </form>
              ) : (
                "—"
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}
