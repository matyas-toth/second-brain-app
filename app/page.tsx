import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { BrainIcon, AiBrain02Icon, SparklesIcon, Calendar03Icon, DatabaseIcon } from "@hugeicons/core-free-icons";

export default async function LandingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
      {/* Background patterns */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <header className="flex h-20 items-center justify-between px-6 md:px-12 border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <HugeiconsIcon icon={BrainIcon} size={28} className="text-primary" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Second Brain</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground mr-auto ml-12">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">Methodology</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-medium">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="px-5 font-medium">Get started — Free</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 py-24 md:py-32 text-center overflow-hidden">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <HugeiconsIcon icon={SparklesIcon} size={14} />
              <span>The Organic Second Brain is here</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05]">
              Stop managing tasks.<br />
              <span className="text-muted-foreground">Start evolving them.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
              Most productivity tools are graveyards for forgotten ideas. 
              Our AI Second Brain doesn&apos;t just store your data—it breathes with it, reminding you when it's time to act.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-base font-semibold shadow-xl shadow-primary/20">
                  Build Your Second Brain
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-14 px-8 text-base font-medium">
                Watch the methodology
              </Button>
            </div>
          </div>
        </section>

        {/* Problem Section (PAS) */}
        <section id="features" className="px-6 py-24 bg-muted/30">
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The Information Overload Trap</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                You juggle notes in one app, tasks in another, and million-dollar ideas scattered across browser tabs. 
                Everything feels important, yet nothing gets done. 
                Your digital workspace is noisy, passive, and overwhelming.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Static Information", icon: DatabaseIcon, text: "Data that sits there until you manually find it." },
                  { title: "Frictional Capture", icon: BrainIcon, text: "Complex forms that kill your creative flow." },
                  { title: "Task Decay", icon: Calendar03Icon, text: "Hundreds of stale tasks rotting in your backlog." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-background/50">
                    <div className="mt-1 rounded-md bg-primary/10 p-2 text-primary">
                      <HugeiconsIcon icon={item.icon} size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-square rounded-2xl bg-linear-to-tr from-primary/20 via-primary/5 to-transparent border border-primary/20 flex items-center justify-center p-8 overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
               <div className="relative z-10 w-full rounded-xl border border-border bg-background shadow-2xl p-6 space-y-4">
                  <div className="h-3 w-1/2 rounded-full bg-primary/20" />
                  <div className="h-3 w-3/4 rounded-full bg-muted" />
                  <div className="h-20 w-full rounded-lg bg-muted/30 animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-md bg-primary/10" />
                    <div className="h-8 w-20 rounded-md bg-primary/10" />
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="px-6 py-24 text-center">
          <div className="mx-auto max-w-4xl space-y-12">
            <h2 className="text-4xl font-bold tracking-tight font-display">A Proactive Collaborator</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
              {[
                { title: "Organic Growth", text: "AI that helps your ideas bloom or gracefully decay over time.", icon: AiBrain02Icon },
                { title: "Ambient Capture", icon: SparklesIcon, text: "Whisper your thoughts, the brain handles the organization." },
                { title: "Real-time Context", icon: SparklesIcon, text: "Your tasks and chats synchronized in a single unified view." },
              ].map((feature, i) => (
                <div key={i} className="space-y-4 p-6 rounded-2xl border border-border transition-all hover:shadow-lg hover:-translate-y-1">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                    <HugeiconsIcon icon={feature.icon} size={24} />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-12 px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2">
              <HugeiconsIcon icon={BrainIcon} size={20} className="text-muted-foreground" />
              <span className="font-semibold tracking-tight text-muted-foreground">Second Brain</span>
           </div>
           <div className="text-sm text-muted-foreground">
             &copy; 2026 Advanced Agentic Coding. All rights reserved.
           </div>
           <div className="flex gap-6 text-sm font-medium text-muted-foreground">
             <a href="#" className="hover:text-foreground">Twitter</a>
             <a href="#" className="hover:text-foreground">GitHub</a>
             <a href="#" className="hover:text-foreground">Support</a>
           </div>
        </div>
      </footer>
    </div>
  );
}
