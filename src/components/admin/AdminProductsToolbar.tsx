"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import styled from "styled-components";
import { AppSelect } from "@/components/ui/AppSelect";
import { Input } from "@/components/ui/Input";
import { AdminButton } from "@/components/admin/AdminButtons";

type Props = {
  locale: string;
  actionPath: string;
  initialQuery: string;
  initialStatus: "all" | "active" | "draft";
  labels: {
    search: string;
    searchPlaceholder: string;
    status: string;
    all: string;
    active: string;
    draft: string;
    apply: string;
    reset: string;
  };
};

const Bar = styled.form`
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr);
  align-items: end;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};

  @media (min-width: 720px) {
    grid-template-columns: minmax(0, 1.6fr) minmax(160px, 0.7fr) auto auto;
  }
`;

const Field = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

const FieldLabel = styled.label`
  margin: 0;
  font-size: 0.64rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export function AdminProductsToolbar({
  locale,
  actionPath,
  initialQuery,
  initialStatus,
  labels,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(initialQuery);
    setStatus(initialStatus);
  }, [initialQuery, initialStatus]);

  function push(nextQuery: string, nextStatus: "all" | "active" | "draft") {
    const params = new URLSearchParams();
    const q = nextQuery.trim();
    if (q) params.set("q", q);
    if (nextStatus !== "all") params.set("status", nextStatus);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${actionPath}?${qs}` : actionPath);
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    push(query, status);
  }

  return (
    <Bar onSubmit={onSubmit} aria-busy={pending}>
      <Field>
        <FieldLabel htmlFor="admin-products-q">{labels.search}</FieldLabel>
        <Input
          id="admin-products-q"
          name="q"
          type="search"
          value={query}
          placeholder={labels.searchPlaceholder}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="admin-products-status">{labels.status}</FieldLabel>
        <AppSelect
          id="admin-products-status"
          ariaLabel={labels.status}
          value={status}
          onValueChange={(value) => {
            const next = value === "active" || value === "draft" ? value : "all";
            setStatus(next);
            push(query, next);
          }}
          options={[
            { value: "all", label: labels.all },
            { value: "active", label: labels.active },
            { value: "draft", label: labels.draft },
          ]}
        />
      </Field>
      <Actions>
        <AdminButton type="submit" disabled={pending}>
          {labels.apply}
        </AdminButton>
        <AdminButton
          type="button"
          $variant="ghost"
          disabled={pending || (!initialQuery && initialStatus === "all")}
          onClick={() => {
            setQuery("");
            setStatus("all");
            push("", "all");
          }}
        >
          {labels.reset}
        </AdminButton>
      </Actions>
      <input type="hidden" name="locale" value={locale} />
    </Bar>
  );
}
