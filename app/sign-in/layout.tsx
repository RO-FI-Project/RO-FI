import { RootProviders } from "@/components/RootProviders";

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <RootProviders>{children}</RootProviders>;
}
