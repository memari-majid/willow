import { Suspense } from "react";

import { AUTH_COPY } from "@/lib/site-copy";

import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-20 text-center text-sm text-muted-foreground">
          {AUTH_COPY.loading}
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
