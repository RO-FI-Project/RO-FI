import { ConvexProviders } from "@/components/ConvexProviders";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <ConvexProviders>{children}</ConvexProviders>;
}
