"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, GoogleIcon, DiscordIcon, Mail01Icon, AccessIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "github" | "google" | "discord") => {
    await signIn.social({
      provider,
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your second brain
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <HugeiconsIcon
                icon={Mail01Icon}
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
              />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11"
                required
              />
            </div>
            <div className="relative">
              <HugeiconsIcon
                icon={AccessIcon}
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" className="h-11" onClick={() => handleSocialLogin("github")}>
            <HugeiconsIcon icon={GithubIcon} size={20} />
          </Button>
          <Button variant="outline" className="h-11" onClick={() => handleSocialLogin("google")}>
            <HugeiconsIcon icon={GoogleIcon} size={20} />
          </Button>
          <Button variant="outline" className="h-11" onClick={() => handleSocialLogin("discord")}>
            <HugeiconsIcon icon={DiscordIcon} size={20} />
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
