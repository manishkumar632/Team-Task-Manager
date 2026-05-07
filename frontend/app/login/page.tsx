import type { Metadata } from "next";
import { AuthCard, AuthFooterLink } from "@/components/auth-card";

export const metadata: Metadata = {
  title: "Sign in — Lumen",
  description: "Sign in to your Lumen account.",
};

export default function LoginPage() {
  return (
    <AuthCard
      mode="login"
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <AuthFooterLink
          prompt="New to Lumen?"
          href="/signup"
          cta="Create an account"
        />
      }
    />
  );
}
