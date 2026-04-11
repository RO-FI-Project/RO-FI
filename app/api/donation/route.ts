import { NextResponse } from "next/server";
import { z } from "zod";

const donationSchema = z.object({
  channel: z.enum(["vn_bank", "paypal", "stripe"]),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = donationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
