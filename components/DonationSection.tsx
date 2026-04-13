"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Copy, CreditCard, Heart, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const fallbackSettings = {
  bankName: "Vietcombank",
  bankAccountNumber: "1234 567 890",
  bankAccountName: "RF MUSIC",
  bankQrUrl: "",
  paypalUrl: "https://paypal.me/yourname",
  stripeUrl: "https://buy.stripe.com/yourlink",
};

export function DonationSection() {
  const settings = useQuery(api.siteSettings.getPublic);
  const donation = settings?.donation ?? fallbackSettings;

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

  return (
    <section id="donate" className="py-16 md:py-24 bg-white/50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4 flex items-center justify-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            Ủng hộ RF
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Mọi đóng góp sẽ được chuyển trực tiếp đến mình để đầu tư cho các sản phẩm mới, không qua nền tảng trung gian.
          </p>
        </div>

        <Card className="border-none shadow-xl shadow-primary/5 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-display">Chọn phương thức donate</CardTitle>
            <CardDescription>Ưu tiên chuyển khoản VN, có thêm lựa chọn quốc tế</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="domestic" className="w-full flex-col">
              <TabsList className="flex w-full mb-8 bg-muted/50 p-1 rounded-full h-12">
                <TabsTrigger value="domestic" className="rounded-full data-active:bg-white data-active:shadow-sm text-base">
                  Việt Nam (VND)
                </TabsTrigger>
                <TabsTrigger value="international" className="rounded-full data-active:bg-white data-active:shadow-sm text-base">
                  Quốc tế (USD)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="domestic" className="space-y-6 animate-in fade-in-50 duration-300">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="bg-muted/30 p-6 rounded-2xl border border-primary/10">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Chuyển khoản ngân hàng
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Ngân hàng</p>
                          <p className="font-medium">{donation.bankName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Tên tài khoản</p>
                          <p className="font-medium">{donation.bankAccountName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Số tài khoản</p>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-lg font-semibold text-primary">{donation.bankAccountNumber}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => copyToClipboard(donation.bankAccountNumber, "Số tài khoản")}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-primary/10 shadow-sm">
                    <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
                      <QrCode className="w-16 h-16 text-muted-foreground/30" />
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                        <p className="text-sm font-medium text-center px-4">
                          {donation.bankQrUrl ? "VietQR của RF" : "Chưa có QR"}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Quét VietQR để chuyển khoản nhanh, phí nền tảng 0%.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="international" className="space-y-6 animate-in fade-in-50 duration-300">
                <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <a
                    href={donation.paypalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ size: "lg", className: "h-16 text-lg rounded-2xl bg-[#0070ba] hover:bg-[#003087] text-white" })}
                    onClick={() => void logDonateClick("paypal")}
                  >
                    Donate via PayPal
                  </a>
                  <a
                    href={donation.stripeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ size: "lg", className: "h-16 text-lg rounded-2xl bg-[#635bff] hover:bg-[#4b45c6] text-white" })}
                    onClick={() => void logDonateClick("stripe")}
                  >
                    Donate via Stripe
                  </a>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Thanh toán quốc tế qua PayPal/Stripe, có thể phát sinh phí chuyển đổi theo nhà cung cấp.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
