"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <SignIn
        routing="path"
        path="/sign-in"
        forceRedirectUrl="/admin/dashboard"
        fallbackRedirectUrl="/admin/dashboard"
      />
    </div>
  );
}
