import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { DonationSection } from "@/components/DonationSection";
import { ReleaseSchedule } from "@/components/ReleaseSchedule";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <HeroSection />
        <DonationSection />
        <ReleaseSchedule />
        <ContactSection />
      </div>
      <Footer />
    </main>
  );
}
