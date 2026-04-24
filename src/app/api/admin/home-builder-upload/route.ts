import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const ALLOWED_KIND = new Set(["image", "video"]);
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export const runtime = "nodejs";

function extensionFromFile(file: File, fallback: string) {
  if (file.name.includes(".")) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext) return ext;
  }
  return fallback;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const kind = String(formData.get("kind") ?? "").toLowerCase();
    if (!(file instanceof File) || file.size <= 0 || !ALLOWED_KIND.has(kind)) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "file_too_large", message: "Max file size is 25MB" },
        { status: 413 },
      );
    }

    const fallbackExt = kind === "video" ? "mp4" : "jpg";
    const extension = extensionFromFile(file, fallbackExt);
    const filePath = `site/home-builder/${Date.now()}-${Math.random().toString(16).slice(2, 8)}.${extension}`;
    const service = createServiceClient();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await service.storage
      .from("product-images")
      .upload(filePath, bytes, { contentType: file.type || undefined, upsert: false });
    if (error) {
      console.error("[api:home-builder-upload]", error);
      return NextResponse.json(
        {
          error: "upload_failed",
          message: error.message,
          code: error.name ?? null,
        },
        { status: 500 },
      );
    }

    const { data } = service.storage.from("product-images").getPublicUrl(filePath);
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    console.error("[api:home-builder-upload:unexpected]", error);
    return NextResponse.json(
      {
        error: "internal_error",
        message: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 },
    );
  }
}
