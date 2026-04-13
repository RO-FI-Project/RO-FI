"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Heart, QrCode, Coffee } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "motion/react";

const fallbackSettings = {
  bankName: "Vietcombank",
  bankAccountNumber: "1234 567 890",
  bankAccountName: "RF MUSIC",
  bankQrUrl: "",
  paypalUrl: "https://paypal.me/yourname",
  stripeUrl: "https://buy.stripe.com/yourlink",
};

const VND_PER_UNIT = 50000;

export function DonationSection() {
  const settings = useQuery(api.siteSettings.getPublic);
  const donation = settings?.donation ?? fallbackSettings;
  const [method, setMethod] = useState<"domestic" | "international">("domestic");
  const [amount, setAmount] = useState<number>(3);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const copyToClipboard = (text: string, label: string) => {
    void navigator.clipboard.writeText(text);
    toast.success(`${label} đã được copy.`);
  };

  const logDonateClick = async (channel: "vn_bank" | "paypal" | "stripe") => {
    try {
      await fetch("/api/donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      });
    } catch {
      // ignore logging errors
    }
  };

  const displayAmount = customAmount ? Number.parseInt(customAmount, 10) || 0 : amount;
  const vndAmount = displayAmount * VND_PER_UNIT;
  const hasQr = Boolean(donation.bankQrUrl);

  return (
    <section id="donate" className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-primary/10 text-primary text-sm font-bold tracking-wide uppercase">
              <Heart className="w-4 h-4 fill-primary" />
              <span>Support the Creator</span>
            </div>

            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-tight">
              Fuel my next <br className="hidden lg:block" />
              <span className="text-primary">musical journey</span> ✨
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Nếu âm nhạc hoặc dự án của RF làm bạn vui, hãy ủng hộ để mình đầu tư thêm thiết bị, phần mềm và dành
              nhiều thời gian sáng tạo hơn.
            </p>
          </div>

          <Card className="border-none shadow-2xl shadow-primary/10 bg-white/90 backdrop-blur-md rounded-4xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <h3 className="font-display text-2xl font-semibold mb-6 flex items-center gap-3">
                Buy RF a Coffee <Coffee className="w-6 h-6 text-primary" />
              </h3>

              <div className="bg-primary/5 p-4 rounded-3xl mb-6 flex flex-wrap items-center gap-4 border border-primary/10">
                <div className="flex items-center gap-2 text-primary font-display text-xl font-semibold">
                  <Coffee className="w-6 h-6 fill-primary/20" /> x
                </div>
                <div className="flex gap-2 flex-1">
                  {[1, 3, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setAmount(num);
                        setCustomAmount("");
                      }}
                      className={`w-12 h-12 rounded-full font-display text-lg font-semibold transition-all ${
                        amount === num && !customAmount
                          ? "bg-primary text-white shadow-md shadow-primary/30 scale-110"
                          : "bg-white text-foreground hover:bg-primary/10 border border-primary/10"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <Input
                    type="number"
                    placeholder="Custom"
                    value={customAmount}
                    onChange={(event) => {
                      setCustomAmount(event.target.value);
                      setAmount(0);
                    }}
                    className={`flex-1 h-12 rounded-full text-center font-display text-lg bg-white border-primary/10 ${
                      customAmount ? "border-primary ring-2 ring-primary/20" : ""
                    }`}
                  />
                </div>
              </div>

              <div className="mb-8">
                <Textarea
                  placeholder="Để lại lời nhắn (tuỳ chọn)..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="bg-white/50 border-primary/10 rounded-3xl resize-none min-h-[100px] focus-visible:ring-primary/20"
                />
              </div>

              <div className="flex p-1 bg-muted/50 rounded-full mb-6">
                <button
                  type="button"
                  onClick={() => setMethod("domestic")}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all ${
                    method === "domestic" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Domestic (VND)
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("international")}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all ${
                    method === "international" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  International (USD)
                </button>
              </div>

              <AnimatePresence mode="wait">
                {method === "domestic" ? (
                  <motion.div
                    key="domestic"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="bg-[#f8f9fa] rounded-3xl p-4 border border-border flex gap-4 items-center">
                      <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-border flex items-center justify-center shrink-0 relative overflow-hidden group">
                        {hasQr ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={donation.bankQrUrl} alt="VietQR" className="w-full h-full object-cover" />
                        ) : (
                          <QrCode className="w-10 h-10 text-muted-foreground/30" />
                        )}
                        <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-full shadow-sm text-center">
                            {hasQr ? "View QR" : "No QR"}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Transfer Details</p>
                        <p className="font-semibold text-sm truncate">{donation.bankName}</p>
                        <p className="font-semibold text-sm truncate">{donation.bankAccountName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="font-mono text-primary font-bold text-lg">{donation.bankAccountNumber}</p>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(donation.bankAccountNumber, "Số tài khoản")}
                            className="p-1.5 hover:bg-primary/10 rounded-md text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {displayAmount > 0 && (
                      <p className="text-center text-sm font-medium text-muted-foreground bg-primary/5 py-2 rounded-full">
                        Suggested amount: <span className="font-bold text-primary">{vndAmount.toLocaleString()} VND</span>
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="international"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <a
                      href={donation.paypalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full h-14 text-base font-semibold rounded-3xl bg-[#0070ba] hover:bg-[#003087] text-white shadow-md transition-colors"
                      onClick={() => void logDonateClick("paypal")}
                    >
                      Donate via PayPal
                    </a>
                    <a
                      href={donation.stripeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full h-14 text-base font-semibold rounded-3xl bg-[#635bff] hover:bg-[#4b45c6] text-white shadow-md transition-colors"
                      onClick={() => void logDonateClick("stripe")}
                    >
                      Donate via Stripe
                    </a>
                    <p className="text-center text-xs text-muted-foreground mt-4">
                      Thanh toán quốc tế an toàn. 100% chuyển trực tiếp đến RF.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
