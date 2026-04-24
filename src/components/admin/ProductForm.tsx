import { createProduct, updateProduct } from "@/app/actions/admin-products";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/get-dictionary";
import type { ProductRow } from "@/types";
import { Button } from "@/components/ui/Button";
import { Field, Input, Label, TextArea } from "@/components/ui/Input";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  locale: Locale;
  dict: Messages;
  product?: ProductRow;
};

/** Shared bilingual admin form — posts to the matching server action. */
export function ProductForm({ mode, locale, dict, product }: Props) {
  const action = mode === "create" ? createProduct : updateProduct;

  return (
    <form action={action} style={{ maxWidth: 560 }}>
      <input type="hidden" name="locale" value={locale} />
      {mode === "edit" && product ? (
        <input type="hidden" name="id" value={product.id} />
      ) : null}

      <Field>
        <Label htmlFor="slug">{dict.admin.slug}</Label>
        <Input
          id="slug"
          name="slug"
          required
          defaultValue={product?.slug}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          title="a-z 0-9 hyphen"
        />
      </Field>
      <Field>
        <Label htmlFor="name_ru">{dict.admin.nameRu}</Label>
        <Input
          id="name_ru"
          name="name_ru"
          required
          defaultValue={product?.name_ru}
        />
      </Field>
      <Field>
        <Label htmlFor="name_en">{dict.admin.nameEn}</Label>
        <Input
          id="name_en"
          name="name_en"
          required
          defaultValue={product?.name_en}
        />
      </Field>
      <Field>
        <Label htmlFor="description_ru">{dict.admin.descRu}</Label>
        <TextArea
          id="description_ru"
          name="description_ru"
          defaultValue={product?.description_ru ?? ""}
        />
      </Field>
      <Field>
        <Label htmlFor="description_en">{dict.admin.descEn}</Label>
        <TextArea
          id="description_en"
          name="description_en"
          defaultValue={product?.description_en ?? ""}
        />
      </Field>
      <Field>
        <Label htmlFor="price_cents">{dict.admin.price}</Label>
        <Input
          id="price_cents"
          name="price_cents"
          type="number"
          min={0}
          required
          defaultValue={product?.price_cents ?? 0}
        />
      </Field>
      <Field>
        <Label htmlFor="currency">{dict.admin.currency}</Label>
        <Input
          id="currency"
          name="currency"
          defaultValue={product?.currency ?? "usd"}
        />
      </Field>
      <Field>
        <Label htmlFor="category">{dict.admin.category}</Label>
        <Input
          id="category"
          name="category"
          defaultValue={product?.category ?? ""}
        />
      </Field>
      <Field>
        <Label htmlFor="stock">{dict.admin.stock}</Label>
        <Input
          id="stock"
          name="stock"
          type="number"
          min={0}
          defaultValue={product?.stock ?? 0}
        />
      </Field>
      <Field>
        <Label htmlFor="image_url">{dict.admin.imageUrl}</Label>
        <Input
          id="image_url"
          name="image_url"
          defaultValue={product?.image_url ?? ""}
        />
      </Field>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            name="featured"
            defaultChecked={product?.featured}
          />
          {dict.admin.featured}
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            name="active"
            defaultChecked={product?.active ?? true}
          />
          {dict.admin.active}
        </label>
      </div>
      <Button type="submit">{dict.admin.save}</Button>
    </form>
  );
}
