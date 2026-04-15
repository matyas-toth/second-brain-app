"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useInView } from "motion/react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BrainIcon,
  ArrowRight02Icon,
  SparklesIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DATA CONSTANTS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface DemoTask {
  t: string;
  p: string;
  c: string;
}

interface TaskState {
  now: DemoTask[];
  next: DemoTask[];
  done: DemoTask[];
}

interface HeroScene {
  userMsg: string;
  tool: string;
  reply: string;
  tasks: TaskState;
}

const INITIAL_TASKS: TaskState = {
  now: [{ t: "Stripe integration", p: "🚀 SaaS Launch", c: "#3b82f6" }],
  next: [{ t: "Design pricing page", p: "🚀 SaaS Launch", c: "#3b82f6" }],
  done: [],
};

const HERO_SCENES: HeroScene[] = [
  {
    userMsg: "just finished the stripe integration",
    tool: "Updating status → DONE",
    reply: "Nice, crossed it off! ✓",
    tasks: {
      now: [],
      next: [{ t: "Design pricing page", p: "🚀 SaaS Launch", c: "#3b82f6" }],
      done: [{ t: "Stripe integration", p: "🚀 SaaS Launch", c: "#3b82f6" }],
    },
  },
  {
    userMsg: "starting the pricing page design now",
    tool: "Updating status → IN_PROGRESS",
    reply: "On it — tracking it now",
    tasks: {
      now: [{ t: "Design pricing page", p: "🚀 SaaS Launch", c: "#3b82f6" }],
      next: [],
      done: [{ t: "Stripe integration", p: "🚀 SaaS Launch", c: "#3b82f6" }],
    },
  },
  {
    userMsg: "add: write API docs by end of week",
    tool: "Adding task 'Write API docs'",
    reply: "Queued it up for you",
    tasks: {
      now: [{ t: "Design pricing page", p: "🚀 SaaS Launch", c: "#3b82f6" }],
      next: [{ t: "Write API docs", p: "🚀 SaaS Launch", c: "#3b82f6" }],
      done: [{ t: "Stripe integration", p: "🚀 SaaS Launch", c: "#3b82f6" }],
    },
  },
  {
    userMsg: "save this: webhook secret is whsec_8kx...",
    tool: "Saving to memory...",
    reply: "Locked in the vault 🔒",
    tasks: {
      now: [{ t: "Design pricing page", p: "🚀 SaaS Launch", c: "#3b82f6" }],
      next: [{ t: "Write API docs", p: "🚀 SaaS Launch", c: "#3b82f6" }],
      done: [{ t: "Stripe integration", p: "🚀 SaaS Launch", c: "#3b82f6" }],
    },
  },
  {
    userMsg: "new project for the portfolio redesign",
    tool: "Creating project ✨ Portfolio",
    reply: "Created! What's the first move?",
    tasks: {
      now: [{ t: "Design pricing page", p: "🚀 SaaS Launch", c: "#3b82f6" }],
      next: [
        { t: "Write API docs", p: "🚀 SaaS Launch", c: "#3b82f6" },
        { t: "Hero section", p: "✨ Portfolio", c: "#8b5cf6" },
      ],
      done: [{ t: "Stripe integration", p: "🚀 SaaS Launch", c: "#3b82f6" }],
    },
  },
  {
    userMsg: "done with the pricing page, looks great",
    tool: "Updating status → DONE",
    reply: "Shipped! 🎯 Nice work",
    tasks: {
      now: [],
      next: [
        { t: "Write API docs", p: "🚀 SaaS Launch", c: "#3b82f6" },
        { t: "Hero section", p: "✨ Portfolio", c: "#8b5cf6" },
      ],
      done: [
        { t: "Design pricing page", p: "🚀 SaaS Launch", c: "#3b82f6" },
        { t: "Stripe integration", p: "🚀 SaaS Launch", c: "#3b82f6" },
      ],
    },
  },
  {
    userMsg: "I'll start on the API docs now",
    tool: "Updating status → IN_PROGRESS",
    reply: "Let's go! You're on a roll",
    tasks: {
      now: [{ t: "Write API docs", p: "🚀 SaaS Launch", c: "#3b82f6" }],
      next: [{ t: "Hero section", p: "✨ Portfolio", c: "#8b5cf6" }],
      done: [
        { t: "Design pricing page", p: "🚀 SaaS Launch", c: "#3b82f6" },
        { t: "Stripe integration", p: "🚀 SaaS Launch", c: "#3b82f6" },
      ],
    },
  },
  {
    userMsg: "idea: add dark mode toggle to portfolio",
    tool: "Adding idea 'Dark mode toggle'",
    reply: "Noted under Portfolio 💡",
    tasks: {
      now: [{ t: "Write API docs", p: "🚀 SaaS Launch", c: "#3b82f6" }],
      next: [{ t: "Hero section", p: "✨ Portfolio", c: "#8b5cf6" }],
      done: [
        { t: "Design pricing page", p: "🚀 SaaS Launch", c: "#3b82f6" },
        { t: "Stripe integration", p: "🚀 SaaS Launch", c: "#3b82f6" },
      ],
    },
  },
];

const VAULT_MEMORIES = [
  {
    content:
      "Stripe webhook endpoint: /api/billing/webhook. Secret starts with whsec_8kx. Always verify signature.",
    date: "Mar 12, 2026",
  },
  {
    content:
      "Client wants dark theme only for dashboard v1. Skip light mode entirely until launch.",
    date: "Mar 8, 2026",
  },
  {
    content:
      "Deploy command: npx vercel --prod. Environment variables live in team dashboard under Settings.",
    date: "Feb 28, 2026",
  },
];

const FAQ_ITEMS = [
  {
    q: "What exactly is a 'second brain'?",
    a: "It's your external memory + task manager + idea capture, all in one conversational interface. Instead of organizing things yourself, you just talk — and it structures everything into projects, tasks, notes, and searchable memories.",
  },
  {
    q: "How is this different from Notion or Todoist?",
    a: "You don't organize anything. You talk. It organizes. No templates, no databases, no manual sorting. Just dump your thoughts in plain language and the AI handles structure, categorization, and tracking for you.",
  },
  {
    q: "What counts as a 'token'?",
    a: "Every message you send and receive uses tokens — think of them as thinking fuel for the AI. A typical back-and-forth uses about 500-1,000 tokens. The free tier gives you enough to properly test-drive the full experience.",
  },
  {
    q: "Can I juggle multiple projects at once?",
    a: "That's the whole point. The AI auto-detects and separates projects based on what you say. Switch between contexts naturally in the same chat — it keeps everything organized across all of them.",
  },
  {
    q: "What happens when my quota runs out?",
    a: "Free users can upgrade to Pro for rolling quotas. Paid users' quotas reset automatically every 8 hours. You never lose data — you just pause on new AI interactions until the window resets.",
  },
  {
    q: "Is my data private?",
    a: "100%. Each user's data is fully isolated. We don't train on your data, share it, or use it for anything other than powering your personal second brain. Your thoughts stay yours.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started and see if it clicks",
    features: [
      "50k token lifetime allowance",
      "Unlimited projects & tasks",
      "AI chat + task manager",
      "Memory vault",
      "Full experience, no limits on features",
    ],
    cta: "Start Free",
    variant: "outline" as const,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/mo",
    description: "For solopreneurs shipping real products",
    features: [
      "250k tokens per 8-hour window",
      "Everything in Free",
      "Rolling quota that auto-resets",
      "Extended AI context window",
      "Priority support",
    ],
    cta: "Unlock Pro",
    variant: "default" as const,
    highlighted: true,
  },
  {
    name: "Ultra",
    price: "$39",
    period: "/mo",
    description: "For multi-project operators who live in here",
    features: [
      "2.5M tokens per 8-hour window",
      "Everything in Pro",
      "Massive AI context window",
      "Power user features",
      "Dedicated support",
    ],
    cta: "Go Ultra",
    variant: "outline" as const,
    highlighted: false,
  },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN PAGE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden">
      <Navbar session={session} />
      <HeroSection session={session} />
      <ProblemStrip />
      <HowItWorks />
      <MemoryVaultSection />
      <BentoShowcase />
      <PricingSection session={session} />
      <FAQSection />
      <FinalCTA session={session} />
      <LandingFooter />
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SCROLL REVEAL WRAPPER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HERO DEMO HOOK
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type HeroPhase = "typing" | "thinking" | "tool" | "reply" | "pause";

function useHeroDemo() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [phase, setPhase] = useState<HeroPhase>("typing");
  const [typed, setTyped] = useState(0);
  const totalScenes = useRef(0);

  const scene = HERO_SCENES[sceneIdx % HERO_SCENES.length];

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    switch (phase) {
      case "typing":
        if (typed < scene.userMsg.length) {
          timeout = setTimeout(
            () => setTyped((t) => t + 1),
            38 + Math.random() * 25
          );
        } else {
          timeout = setTimeout(() => setPhase("thinking"), 400);
        }
        break;
      case "thinking":
        timeout = setTimeout(() => setPhase("tool"), 700);
        break;
      case "tool":
        timeout = setTimeout(() => setPhase("reply"), 800);
        break;
      case "reply":
        timeout = setTimeout(() => setPhase("pause"), 2500);
        break;
      case "pause":
        timeout = setTimeout(() => {
          totalScenes.current += 1;
          setSceneIdx((i) => (i + 1) % HERO_SCENES.length);
          setPhase("typing");
          setTyped(0);
        }, 800);
        break;
    }

    return () => clearTimeout(timeout);
  }, [phase, typed, scene.userMsg.length]);

  const showCurrentTasks =
    phase === "tool" || phase === "reply" || phase === "pause";
  const taskState = showCurrentTasks
    ? scene.tasks
    : totalScenes.current === 0
      ? INITIAL_TASKS
      : HERO_SCENES[
        (sceneIdx - 1 + HERO_SCENES.length) % HERO_SCENES.length
      ].tasks;

  const prevReply =
    totalScenes.current > 0
      ? HERO_SCENES[
        (sceneIdx - 1 + HERO_SCENES.length) % HERO_SCENES.length
      ].reply
      : null;

  return { scene, phase, typed, taskState, prevReply, sceneIdx };
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. NAVBAR
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function Navbar({ session }: { session: any }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed mx-auto container mt-4 rounded-full top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-4 pr-6! py-1 transition-all duration-700 ease-in-out",
        scrolled &&
        "bg-background/80 w-4xl backdrop-blur-xl border-b border-border/50 shadow-[0_0_100px_#00000044]"
      )}
    >
      <div className="flex items-center gap-1">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl">
          <HugeiconsIcon
            icon={BrainIcon}
            size={48}
            strokeWidth={1.8}
            className="text-foreground"
          />
        </div>
        <span className="text-3xl font-medium tracking-tighter text-foreground">
          Second Brain
        </span>
      </div>
      <div className="flex items-center gap-2">
        {session ? (
          <Link href="/dashboard">
            <Button
              size="lg"
              className="rounded-full px-5 text-lg font-medium"
            >
              Dashboard
            </Button>
          </Link>
        ) : (
          <>
            <Link href="/login">
              <Button
                variant="ghost"
                size="lg"
                className="text-lg font-medium rounded-full text-muted-foreground"
              >
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                className="rounded-full px-5 text-lg font-medium"
              >
                Build My Brain
              </Button>
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   2. HERO
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function HeroSection({ session }: { session: any }) {
  const ctaHref = session ? "/dashboard" : "/register";
  const ctaText = session
    ? "Go to Dashboard"
    : "Build My Second Brain for Free";

  return (
    <section className="relative min-h-[100dvh] flex items-center pt-20 pb-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          {/* Left: Copy */}
          <ScrollReveal className="flex-1 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight font-medium tracking-tighter">
              Stop Managing Tasks.
              <br />
              <span className="tracking-tight">Just Say What You Did.</span>
            </h1>
            <p className="text-lg md:text-2xl font-medium max-w-xl tracking-tight text-muted-foreground mt-6 md:mt-8">
              Your AI second brain for solopreneurs. Chat naturally. Projects
              organize themselves.
            </p>
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-8 md:mt-10">
              <Link href={ctaHref}>
                <Button
                  size="lg"
                  className="rounded-full px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-medium"
                >
                  {ctaText}
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-medium"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See How It Works
              </Button>
            </div>
            <p className="text-sm text-muted-foreground/60 mt-5 font-medium">
              Free forever tier · No credit card · 30 seconds to start
            </p>
          </ScrollReveal>

          {/* Right: Demo */}
          <ScrollReveal className="flex-1 w-full max-w-xl" delay={0.3}>
            <HeroDemoArea />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ── Hero Demo Orchestrator ─────────────────────── */

function HeroDemoArea() {
  const { scene, phase, typed, taskState, prevReply } = useHeroDemo();

  return (
    <div className="relative flex flex-col lg:block w-full gap-4 lg:h-[430px]">
      {/* Chat Card */}
      <motion.div

        className="lg:absolute lg:top-0 lg:left-0 w-full lg:w-[350px] z-10"
      >
        <HeroChatCard
          scene={scene}
          phase={phase}
          typed={typed}
          prevReply={prevReply}
        />
      </motion.div>

      {/* Task Card */}
      <motion.div

        className="lg:absolute lg:top-20 lg:left-[400px] w-full lg:w-[350px] z-20"
      >
        <HeroTaskCard tasks={taskState} />
      </motion.div>

      <motion.div className="absolute w-[300px] h-[300px] border-4 border-black border-dashed animate-[spin_30s_linear_infinite] top-20 left-50 rounded-full">


      </motion.div>
    </div>
  );
}

/* ── Hero Chat Card ─────────────────────────────── */

function HeroChatCard({
  scene,
  phase,
  typed,
  prevReply,
}: {
  scene: HeroScene;
  phase: HeroPhase;
  typed: number;
  prevReply: string | null;
}) {
  return (
    <Card className="shadow-xl shadow-black/[0.04] dark:shadow-black/20 border-border/60 py-3">
      <CardHeader className="pb-2 pt-0 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              Chat
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="text-sm h-6 px-2 font-medium"
          >
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-2 min-h-[250px] flex flex-col justify-end">
        {/* Previous reply (context) */}
        <AnimatePresence mode="popLayout">
          {prevReply && (
            <motion.div
              key={prevReply}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.35, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="rounded-2xl bg-muted px-3 py-1.5 text-md text-foreground max-w-[85%]">
                {prevReply}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current user message */}
        <div className="flex justify-end">
          <div
            className="rounded-2xl bg-primary px-3 py-1.5 text-md text-primary-foreground max-w-[85%] min-h-[28px]"
            style={{ cornerShape: "superellipse(1.3)" } as any}
          >
            {scene.userMsg.slice(0, typed)}
            {phase === "typing" && (
              <span className="inline-block w-[1.5px] h-3 bg-primary-foreground/70 ml-0.5 animate-pulse align-middle" />
            )}
          </div>
        </div>

        {/* Thinking dots */}
        <AnimatePresence>
          {phase === "thinking" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 py-0.5"
            >
              <div className="flex gap-[3px]">
                <span className="h-1 w-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="h-1 w-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="h-1 w-1 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-[10px] text-muted-foreground">
                Thinking
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tool notification */}
        <AnimatePresence>
          {(phase === "tool" || phase === "reply" || phase === "pause") && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 py-0.5"
            >
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                size={11}
                className="text-muted-foreground shrink-0"
              />
              <span className="text-[10px] text-muted-foreground">
                {scene.tool}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assistant reply */}
        <AnimatePresence>
          {(phase === "reply" || phase === "pause") && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div
                className="rounded-2xl bg-muted px-3 py-1.5 text-md text-foreground max-w-[85%]"
                style={{ cornerShape: "superellipse(1.3)" } as any}
              >
                {scene.reply}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

/* ── Hero Task Card ─────────────────────────────── */

function HeroTaskCard({ tasks }: { tasks: TaskState }) {
  return (
    <Card className="shadow-xl shadow-black/[0.04] dark:shadow-black/20 border-border/60 py-4">
      <CardHeader className="pb-2 pt-0 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            Mission Control
          </CardTitle>

        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3 min-h-[250px]">
        {/* NOW */}
        {tasks.now.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase tracking-[0.15em] font-medium text-foreground">
                Now
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <AnimatePresence mode="popLayout">
              {tasks.now.map((task) => (
                <motion.div
                  key={task.t}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  layout
                  className="flex items-center gap-2 py-1"
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                      style={{ backgroundColor: task.c }}
                    />
                    <span
                      className="relative inline-flex h-2 w-2 rounded-full"
                      style={{ backgroundColor: task.c }}
                    />
                  </span>
                  <span className="text-md text-foreground font-medium">
                    {task.t}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* NEXT */}
        {tasks.next.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                Next
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <AnimatePresence mode="popLayout">
              {tasks.next.map((task) => (
                <motion.div
                  key={task.t}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  layout
                  className="flex items-center gap-2 py-1"
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: task.c }}
                  />
                  <span className="text-md text-muted-foreground">
                    {task.t}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* DONE */}
        {tasks.done.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                Done
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <AnimatePresence mode="popLayout">
              {tasks.done.map((task) => (
                <motion.div
                  key={task.t}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  layout
                  className="flex items-center gap-2 py-1 opacity-50"
                >
                  <span className="h-2 w-2 rounded-full shrink-0 bg-emerald-400" />
                  <span className="text-md text-muted-foreground line-through">
                    {task.t}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   3. PROBLEM STRIP
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ProblemStrip() {
  return (
    <section className="py-20 md:py-28 ">
      <div className="container mx-auto px-6 text-center">
        <ScrollReveal>
          <p className="text-xl md:text-2xl lg:text-4xl font-medium tracking-tight text-foreground max-w-4xl mx-auto leading-relaxed">
            You manage{" "}
            <span className="text-blue-400">4 projects</span>.{" "}
            <span className="text-green-400">3 note apps</span>.{" "}
            <span className="text-pink-400">2 task boards</span>. And
            nothing actually talks to each other.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            {["Context switching", "Scattered tools", "Manual organizing"].map(
              (pain, i) => (
                <motion.div
                  key={pain}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Badge
                    variant="outline"
                    className="text-lg font-medium px-4 py-4 text-muted-foreground"
                  >
                    {pain}
                  </Badge>
                </motion.div>
              )
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   4. HOW IT WORKS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <ScrollReveal className="text-center mb-14">
          <Badge variant="outline" className="mb-4 font-medium text-lg py-4 px-6">
            How it works
          </Badge>
          <h2 className="text-3xl md:text-6xl font-medium tracking-tighter mt-4">
            Three steps. Zero setup.
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Talk */}
          <ScrollReveal delay={0}>
            <Card className="h-full border-border/60 flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-2xl font-medium text-foreground">
                    1
                  </div>
                  <CardTitle className="text-2xl font-medium">Talk</CardTitle>
                </div>
                <MiniChatInput />
              </CardHeader>
              <CardFooter>
                <CardDescription className="text-sm font-medium leading-relaxed">
                  Dump your thoughts, updates, decisions. In plain language.
                  Like texting a friend who happens to be insanely organized.
                </CardDescription>
              </CardFooter>
            </Card>
          </ScrollReveal>

          {/* Column 2: It Organizes */}
          <ScrollReveal delay={0.15}>
            <Card className="h-full border-border/60 flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-2xl font-medium text-foreground">
                    2
                  </div>
                  <CardTitle className="text-2xl font-medium">
                    It Organizes
                  </CardTitle>
                </div>
                <ToolCallSequence />
              </CardHeader>
              <CardFooter>
                <CardDescription className="text-sm font-medium leading-relaxed">
                  Projects, tasks, notes, ideas — auto-categorized and
                  structured by AI. You never touch a dropdown or kanban column.
                </CardDescription>
              </CardFooter>
            </Card>
          </ScrollReveal>

          {/* Column 3: You Execute */}
          <ScrollReveal delay={0.3}>
            <Card className="h-full border-border/60 flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-2xl font-medium text-foreground">
                    3
                  </div>
                  <CardTitle className="text-2xl font-medium">
                    You Execute
                  </CardTitle>
                </div>
                <MiniTaskBoard />
              </CardHeader>
              <CardFooter>
                <CardDescription className="text-sm font-medium leading-relaxed">
                  See what&apos;s live, what&apos;s next, what&apos;s done. Your
                  mission control updates itself. Zero input needed.
                </CardDescription>
              </CardFooter>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ── Mini Chat Input (auto-typing) ──────────────── */

function MiniChatInput() {
  const phrases = [
    "finished the landing page...",
    "add a task: fix the auth bug...",
    "starting the API integration...",
    "save: webhook secret is whsec...",
  ];
  const [text, setText] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const phraseIdx = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (!isInView) {
      setText("");
      return;
    }

    function cycle() {
      const phrase = phrases[phraseIdx.current % phrases.length];
      let i = 0;
      setText("");

      intervalRef.current = setInterval(() => {
        i++;
        setText(phrase.slice(0, i));
        if (i >= phrase.length) {
          clearInterval(intervalRef.current);
          timerRef.current = setTimeout(() => {
            setText("");
            phraseIdx.current++;
            timerRef.current = setTimeout(cycle, 400);
          }, 2000);
        }
      }, 55);
    }

    timerRef.current = setTimeout(cycle, 500);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(intervalRef.current);
    };
  }, [isInView]);

  return (
    <div
      ref={ref}
      className="flex items-center gap-2 rounded-2xl border border-border/50 bg-muted/30 px-3 py-2 h-12"
    >
      <span className="text-lg text-foreground flex-1 min-h-[1em]">
        {text}
      </span>

    </div>
  );
}

/* ── Tool Call Sequence ─────────────────────────── */

function ToolCallSequence() {
  const tools = [
    "Creating project 🚀 SaaS Launch",
    "Adding task 'Design pricing page'",
    "Saving to memory...",
  ];

  return (
    <div className="flex flex-col gap-1.5 ">
      {tools.map((tool, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 + i * 0.25, duration: 0.4 }}
          className="flex items-center gap-2 py-0.5"
        >
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={16}
            strokeWidth={2.2}
            className="text-muted-foreground shrink-0"
          />
          <span className="text-md text-muted-foreground">{tool}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Mini Task Board ────────────────────────────── */

function MiniTaskBoard() {
  const sections = [
    {
      label: "Now",
      accent: true,
      items: [{ t: "Design pricing page", pulse: true, color: "#3b82f6" }],
    },
    {
      label: "Next",
      accent: false,
      items: [{ t: "Write API docs", pulse: false, color: "#737373" }],
    },
    {
      label: "Done",
      accent: false,
      items: [
        { t: "Stripe integration", pulse: false, color: "#10b981", done: true },
      ],
    },
  ];

  return (
    <div className="space-y-2.5">
      {sections.map((section) => (
        <div key={section.label}>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "text-[11px] uppercase tracking-[0.15em] font-medium",
                section.accent ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {section.label}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          {section.items.map((item, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 py-0.5",
                (item as any).done && "opacity-50"
              )}
            >
              {item.pulse ? (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                    style={{ backgroundColor: item.color }}
                  />
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </span>
              ) : (
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
              )}
              <span
                className={cn(
                  "text-[16px]",
                  (item as any).done
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                )}
              >
                {item.t}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   5. MEMORY VAULT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function MemoryVaultSection() {
  return (
    <section className="py-20 md:py-28 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          {/* Left: Demo */}
          <ScrollReveal className="flex-1 w-full">
            <MemorySearchDemo />
          </ScrollReveal>

          {/* Right: Copy */}
          <ScrollReveal className="flex-1" delay={0.15}>
            <Badge variant="outline" className="mb-4 font-medium text-md px-4 py-4">
              Memory Vault
            </Badge>
            <h2 className="text-3xl md:text-6xl font-medium tracking-tighter mb-4">
              Your vault remembers
              <br />
              what you forgot
            </h2>
            <p className="text-base text-muted-foreground font-medium leading-relaxed mb-8 max-w-md">
              Every API key, meeting note, project decision, config snippet.
              Searchable. Instantly recalled. Never dig through Slack
              threads again.
            </p>
            <div className="flex flex-col gap-3">
              {[
                "Auto-saved from conversations",
                "Search across everything",
                "Never lose a decision or config again",
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2.5"
                >
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    size={16}
                    className="text-foreground shrink-0"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ── Memory Search Demo ─────────────────────────── */

function MemorySearchDemo() {
  const SEARCH_TERM = "stripe webhook";
  const [searchText, setSearchText] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-80px" });
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (!isInView) {
      setSearchText("");
      return;
    }

    function startCycle() {
      let charIdx = 0;
      setSearchText("");

      timerRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          charIdx++;
          setSearchText(SEARCH_TERM.slice(0, charIdx));
          if (charIdx >= SEARCH_TERM.length) {
            clearInterval(intervalRef.current);
            timerRef.current = setTimeout(() => {
              setSearchText("");
              timerRef.current = setTimeout(startCycle, 1500);
            }, 3500);
          }
        }, 80);
      }, 800);
    }

    startCycle();
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(intervalRef.current);
    };
  }, [isInView]);

  const isMatch = (content: string) => {
    if (!searchText.trim()) return true;
    const terms = searchText.toLowerCase().split(" ");
    return terms.some((term) => content.toLowerCase().includes(term));
  };

  return (
    <Card ref={ref} className="border-border/60 overflow-hidden ">
      <CardHeader className="pb-3 bg-muted/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <HugeiconsIcon icon={BrainIcon} size={26} />
          </div>
          <CardTitle className="text-lg font-medium">Vault Memories</CardTitle>
        </div>
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input
            value={searchText}
            readOnly
            tabIndex={-1}
            placeholder="Search memories..."
            className="pl-8 h-9 text-xs bg-background border-border/50 cursor-default"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 py-0 space-y-2">
        {VAULT_MEMORIES.map((m, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: isMatch(m.content) ? 1 : 0.15,
              scale: isMatch(m.content) ? 1 : 0.97,
            }}
            transition={{ duration: 0.3 }}
            className={cn(
              "rounded-xl border p-3 transition-colors",
              searchText && isMatch(m.content)
                ? "border-foreground/20 bg-muted/30"
                : "border-border/50 bg-card"
            )}
          >
            <p className="text-[14px] text-foreground leading-relaxed">
              {m.content}
            </p>
            <p className="mt-2 text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
              {m.date}
            </p>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   6. BENTO SHOWCASE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function BentoShowcase() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <ScrollReveal className="text-center mb-14">
          <Badge variant="outline" className="mb-4 font-medium text-md px-4 py-4">
            The full picture
          </Badge>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tighter mt-4">
            Everything you need. Nothing you don&apos;t.
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Dashboard Preview — large */}
          <ScrollReveal className="md:col-span-2">
            <Card className="h-full border-border/60 overflow-hidden">
              <CardContent className="p-0">
                <DashboardPreview />
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Project Stack */}
          <ScrollReveal delay={0.1}>
            <Card className="h-full border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Your Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <ProjectStackDemo />
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Quota Meter */}
          <ScrollReveal delay={0.15}>
            <Card className="border-border/60">
              <CardContent className="py-5 px-5">
                <QuotaDemo />
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Theme Toggle */}
          <ScrollReveal delay={0.2}>
            <Card className="border-border/60">
              <CardContent className="py-5 px-5">
                <ThemeToggleDemo />
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Status Pills */}
          <ScrollReveal delay={0.25}>
            <Card className="border-border/60">
              <CardContent className="py-5 px-5">
                <StatusPillsDemo />
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ── Dashboard Preview ──────────────────────────── */

function DashboardPreview() {
  return (
    <div className="flex h-[260px] md:h-[300px] overflow-hidden bg-background">
      {/* Mini sidebar */}
      <div className="w-14 md:w-16 shrink-0 border-r border-border/30 flex flex-col p-2 gap-2">
        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center mx-auto">
          <HugeiconsIcon
            icon={BrainIcon}
            size={14}
            className="text-foreground"
          />
        </div>
        <Separator className="my-1" />
        <div className="space-y-1">
          <div className="h-5 w-full rounded bg-accent/80" />
          <div className="h-5 w-full rounded bg-transparent" />
          <div className="h-5 w-full rounded bg-transparent" />
        </div>
        <div className="mt-auto space-y-1">
          <div className="h-5 w-full rounded bg-muted/50" />
          <div className="h-5 w-full rounded bg-muted/50" />
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col p-3 md:p-4 min-w-0">
        <div className="text-[10px] text-muted-foreground font-medium mb-3 pb-2 border-b border-border/30">
          Chat
        </div>
        <div className="flex-1 space-y-2 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <div
              className="rounded-xl bg-primary px-2.5 py-1 text-[9px] text-primary-foreground max-w-[75%]"
              style={{ cornerShape: "superellipse(1.3)" } as any}
            >
              finished the auth module
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-1"
          >
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={9}
              className="text-muted-foreground"
            />
            <span className="text-[8px] text-muted-foreground">
              Updating status → DONE
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="flex justify-start"
          >
            <div
              className="rounded-xl bg-muted px-2.5 py-1 text-[9px] text-foreground max-w-[75%]"
              style={{ cornerShape: "superellipse(1.3)" } as any}
            >
              Done! What&apos;s the next move?
            </div>
          </motion.div>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex-1 h-7 rounded-full bg-muted/30 border border-border/30 px-2.5 flex items-center">
            <span className="text-[9px] text-muted-foreground/50">
              Tell me what you&apos;re working on...
            </span>
          </div>
          <div className="h-7 w-7 rounded-full bg-primary shrink-0 flex items-center justify-center">
            <svg
              width="10"
              height="10"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-primary-foreground"
            >
              <path d="M8 12V4M4 8l4-4 4 4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Task sidebar */}
      <div className="hidden md:flex w-[140px] lg:w-[180px] shrink-0 border-l border-border/30 flex-col p-3">
        <div className="text-[10px] text-muted-foreground font-medium mb-3 pb-2 border-b border-border/30">
          Mission Control
        </div>
        <div className="space-y-2.5">
          <div>
            <span className="text-[8px] uppercase tracking-[0.15em] font-medium text-foreground">
              Now
            </span>
            <div className="flex items-center gap-1.5 mt-1 py-0.5">
              <span className="relative flex h-1 w-1 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                <span className="relative inline-flex h-1 w-1 rounded-full bg-blue-400" />
              </span>
              <span className="text-[9px] text-foreground truncate">
                Payment API
              </span>
            </div>
          </div>
          <div>
            <span className="text-[8px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
              Next
            </span>
            <div className="flex items-center gap-1.5 mt-1 py-0.5">
              <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
              <span className="text-[9px] text-muted-foreground truncate">
                Portfolio hero
              </span>
            </div>
          </div>
          <div>
            <span className="text-[8px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
              Done
            </span>
            <div className="flex items-center gap-1.5 mt-1 py-0.5 opacity-50">
              <span className="h-1 w-1 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-[9px] text-muted-foreground line-through truncate">
                Auth module
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Project Stack Demo ─────────────────────────── */

function ProjectStackDemo() {
  const projects = [
    { name: "SaaS Launch", emoji: "🚀", color: "#3b82f6", done: 2, total: 5 },
    { name: "Portfolio", emoji: "✨", color: "#8b5cf6", done: 1, total: 3 },
    { name: "API Docs", emoji: "📖", color: "#f59e0b", done: 3, total: 4 },
    { name: "Client Work", emoji: "💼", color: "#10b981", done: 4, total: 7 },
  ];

  return (
    <div className="flex flex-col gap-2">
      {projects.map((p, i) => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border/40 hover:border-border/80 transition-colors group"
        >
          <span
            className="h-3 w-3 rounded-sm shrink-0"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-xs font-medium flex-1 truncate">
            {p.emoji} {p.name}
          </span>
          <Badge
            variant="outline"
            className="text-[9px] h-4 px-1.5 font-medium shrink-0"
          >
            {p.done}/{p.total}
          </Badge>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Quota Demo ─────────────────────────────────── */

function QuotaDemo() {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const t = setTimeout(() => setValue(67), 600);
      return () => clearTimeout(t);
    }
  }, [isInView]);

  return (
    <div ref={ref} className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground font-medium">
          Token Usage
        </Label>
        <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-medium">
          PRO
        </Badge>
      </div>
      <Progress
        value={value}
        className="h-2 transition-all duration-1000 ease-out"
      />
      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
        <span>167k / 250k tokens</span>
        <span>Resets in 4h</span>
      </div>
    </div>
  );
}

/* ── Theme Toggle Demo ──────────────────────────── */

function ThemeToggleDemo() {
  const [demoTheme, setDemoTheme] = useState("dark");

  return (
    <div className="space-y-3">
      <Label className="text-xs text-muted-foreground font-medium">
        Appearance
      </Label>
      <div className="flex w-full items-center rounded-md border border-border/50 bg-background/50 p-0.5">
        {[
          { value: "light", icon: "☀️" },
          { value: "system", icon: "🖥" },
          { value: "dark", icon: "🌙" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDemoTheme(opt.value)}
            className={cn(
              "flex flex-1 items-center justify-center rounded-sm py-1.5 text-xs transition-colors cursor-pointer",
              demoTheme === opt.value
                ? "bg-accent text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50"
            )}
          >
            {opt.icon}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground font-medium">
        Adapts to your system or choice
      </p>
    </div>
  );
}

/* ── Status Pills Demo ──────────────────────────── */

function StatusPillsDemo() {
  const statuses = [
    {
      label: "Todo",
      dot: "bg-blue-400",
      bg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      label: "In Progress",
      dot: "bg-amber-400",
      bg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      label: "Waiting",
      dot: "bg-purple-400",
      bg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    {
      label: "Done",
      dot: "bg-emerald-400",
      bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
  ];

  return (
    <div className="space-y-3">
      <Label className="text-xs text-muted-foreground font-medium">
        Task States
      </Label>
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <span
            key={s.label}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
              s.bg
            )}
          >
            <span className={cn("h-1 w-1 rounded-full", s.dot)} />
            {s.label}
          </span>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground font-medium">
        AI moves tasks between states as you chat
      </p>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   7. PRICING
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function PricingSection({ session }: { session: any }) {
  const ctaHref = session ? "/profile" : "/register";

  return (
    <section className="py-20 md:py-28 border-t border-border/30">
      <div className="container mx-auto px-6">
        <ScrollReveal className="text-center mb-14">
          <Badge variant="outline" className="mb-4 font-medium text-md px-4 py-4">
            Pricing
          </Badge>
          <h2 className="text-3xl md:text-6xl font-medium tracking-tighter mt-2">
            Simple, honest pricing
          </h2>
          <p className="text-muted-foreground font-medium mt-4 max-w-lg mx-auto">
            Start free. Upgrade when you need more thinking power.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {PLANS.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 0.1}>
              <Card
                className={cn(
                  "h-full flex flex-col border-border/60",
                  plan.highlighted && "ring-1 ring-foreground border-foreground"
                )}
              >
                <CardHeader>
                  <Badge
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-fit text-xs font-medium"
                  >
                    {plan.name}
                  </Badge>
                  <CardTitle className="text-4xl font-medium mt-3">
                    {plan.price}
                    <span className="text-base text-muted-foreground font-medium">
                      {plan.period}
                    </span>
                  </CardTitle>
                  <CardDescription className="font-medium text-sm">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-5 flex-1">
                  <div className="flex flex-col gap-3">
                    {plan.features.map((feature, fi) => (
                      <div key={fi} className="flex items-start gap-2.5">
                        <Checkbox
                          checked
                          disabled
                          className="h-4 w-4 mt-0.5 rounded-sm"
                        />
                        <Label className="text-sm font-normal text-muted-foreground leading-tight">
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 border-none mt-4">
                  <Link className="w-full" href={ctaHref}>
                    <Button
                      variant={plan.variant}
                      className="w-full rounded-full font-medium"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="text-center mt-8" delay={0.3}>
          <p className="text-sm text-muted-foreground/60 font-medium">
            No contracts. Cancel anytime. Your data stays yours.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   8. FAQ
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function FAQSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6 max-w-2xl">
        <ScrollReveal className="text-center mb-12">
          <Badge variant="outline" className="mb-4 font-medium text-xs">
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter">
            Questions you might have
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Accordion className="w-full">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm font-medium leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   9. FINAL CTA
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function FinalCTA({ session }: { session: any }) {
  const ctaHref = session ? "/dashboard" : "/register";
  const ctaText = session
    ? "Go to Dashboard"
    : "Build My Second Brain — Free";

  return (
    <section className="py-24 md:py-32 border-t border-border/30">
      <div className="container mx-auto px-6 text-center">
        <ScrollReveal>
          <motion.div
            className="inline-flex mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            }}
          >
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <HugeiconsIcon
                icon={BrainIcon}
                size={28}
                className="text-foreground"
              />
            </div>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tighter max-w-2xl mx-auto">
            Your projects won&apos;t organize themselves.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-lg md:text-xl text-muted-foreground font-medium mt-5 max-w-lg mx-auto">
            Start your second brain in 30 seconds. No credit card. No setup.
            Just talk.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <Link href={ctaHref}>
            <Button
              size="lg"
              className="rounded-full px-10 py-6 text-lg font-medium mt-8"
            >
              {ctaText}
            </Button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   10. FOOTER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function LandingFooter() {
  return (
    <footer className="border-t border-border/50 py-8 px-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <HugeiconsIcon icon={BrainIcon} size={16} />
          <span>Second Brain © 2026</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
          <Link
            href="/login"
            className="hover:text-foreground transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="hover:text-foreground transition-colors"
          >
            Register
          </Link>
          <span className="cursor-default">Privacy</span>
          <span className="cursor-default">Terms</span>
        </div>
      </div>
    </footer>
  );
}
