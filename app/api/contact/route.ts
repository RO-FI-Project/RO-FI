import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  organization: z.string().optional(),
  budget: z.string().optional(),
  deadline: z.string().optional(),
  message: z.string().min(1),
  company: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (parsed.data.company && parsed.data.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM;
  const contactTo = process.env.CONTACT_TO;

  if (!resendKey || !resendFrom || !contactTo) {
    return NextResponse.json({ error: "Missing email config" }, { status: 500 });
  }

  const resend = new Resend(resendKey);

  await resend.emails.send({
    from: resendFrom,
    to: contactTo,
    subject: `RF Collab: ${parsed.data.name}`,
    replyTo: parsed.data.email,
    text: [
      `Tên: ${parsed.data.name}`,
      `Email: ${parsed.data.email}`,
      `Tổ chức: ${parsed.data.organization || "-"}`,
      `Ngân sách: ${parsed.data.budget || "-"}`,
      `Deadline: ${parsed.data.deadline || "-"}`,
      "",
      parsed.data.message,
    ].join("\n"),
  });

  return NextResponse.json({ ok: true });
}
