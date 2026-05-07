import type { Metadata } from "next";
import { AuthCard, AuthFooterLink } from "@/components/auth-card";

export const metadata: Metadata = {
  title: "Create account — Lumen",
  description: "Create your Lumen team task manager account.",
};

export default function SignupPage() {
  return (
    <AuthCard
      mode="signup"
      title="Create your account"
      subtitle="Spin up your workspace in seconds."
      footer={
        <AuthFooterLink
          prompt="Already have an account?"
          href="/login"
          cta="Sign in"
        />
      }
    />
  );
}
