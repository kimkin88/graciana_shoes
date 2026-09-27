import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STRIPE_SESSION = /^cs_[A-Za-z0-9_]+$/;

/** Whether a held checkout has been confirmed by the payment webhook. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const pendingId = url.searchParams.get("pending")?.trim() ?? "";
  const sessionId = url.searchParams.get("session_id")?.trim() ?? "";

  if (pendingId && !UUID.test(pendingId)) {
    return NextResponse.json({ status: "unknown" }, { status: 400 });
  }
  if (sessionId && !STRIPE_SESSION.test(sessionId)) {
    return NextResponse.json({ status: "unknown" }, { status: 400 });
  }
  if (!pendingId && !sessionId) {
    return NextResponse.json({ status: "unknown" }, { status: 400 });
  }

  const service = createServiceClient();

  if (sessionId) {
    const { data: bySession } = await service
      .from("orders")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .eq("status", "paid")
      .maybeSingle();
    if (bySession) return NextResponse.json({ status: "paid" });
  }

  if (pendingId) {
    const { data: byBepaid } = await service
      .from("orders")
      .select("id")
      .like("stripe_session_id", `bepaid:${pendingId}:%`)
      .eq("status", "paid")
      .maybeSingle();
    if (byBepaid) return NextResponse.json({ status: "paid" });

    const { data: pending } = await service
      .from("pending_checkouts")
      .select("id")
      .eq("id", pendingId)
      .maybeSingle();
    if (pending) return NextResponse.json({ status: "pending" });
  }

  return NextResponse.json({ status: "unknown" });
}
