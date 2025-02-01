import {
  LineChart,
  Activity,
  GraduationCap,
  Beaker,
  Brain,
  Shield,
  Scale,
  Calculator,
  HeartPulse,
  TestTube,
  BookOpen,
  UserSquare2,
  Stethoscope,
  Bot,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const dashboardItems: NavItem[] = [
  {
    title: "Analytics Dashboard",
    href: "/dashboard/analytics",
    icon: LineChart,
    description: "Track your study progress and performance metrics",
  },
  {
    title: "Performance Analytics",
    href: "/dashboard/performance",
    icon: Activity,
    description: "Detailed analysis of your test performance and improvements",
  },
  {
    title: "Instructor Dashboard",
    href: "/dashboard/instructor",
    icon: GraduationCap,
    description: "Monitor student progress and manage course content",
  },
];

export const learningModules: NavItem[] = [
  {
    title: "Pharmacology & Parenteral",
    href: "/modules/pharmacology",
    icon: Beaker,
    description: "Study medications, drug calculations, and administration",
  },
  {
    title: "Analyze Cues & Hypotheses",
    href: "/modules/clinical-analysis",
    icon: Brain,
    description: "Develop clinical reasoning and analytical skills",
  },
  {
    title: "Risk Reduction",
    href: "/modules/risk-reduction",
    icon: Shield,
    description: "Learn to identify and minimize patient safety risks",
  },
  {
    title: "Clinical Judgment",
    href: "/modules/clinical-judgment",
    icon: Scale,
    description: "Master the nursing process and decision-making",
  },
  {
    title: "Drug Calculations",
    href: "/modules/calculations",
    icon: Calculator,
    description: "Practice medication dosage calculations",
  },
  {
    title: "Advanced Pathophysiology",
    href: "/modules/pathophysiology",
    icon: HeartPulse,
    description: "Study disease processes and body systems",
  },
];

export const practiceItems: NavItem[] = [
  {
    title: "Practice Quizzes",
    href: "/practice/quizzes",
    icon: TestTube,
    description: "Test your knowledge with topic-specific quizzes",
  },
  {
    title: "Mock NCLEX Exams",
    href: "/practice/mock-exams",
    icon: BookOpen,
    description: "Full-length practice exams in NCLEX format",
  },
  {
    title: "Virtual Patient Scenarios",
    href: "/practice/scenarios",
    icon: UserSquare2,
    description: "Interactive patient care simulations",
  },
  {
    title: "Advanced Simulation",
    href: "/practice/simulation",
    icon: Stethoscope,
    description: "Complex clinical scenarios and decision-making",
  },
];

export const studyTools: NavItem[] = [
  {
    title: "AI Voice Study Companion",
    href: "/tools/ai-companion",
    icon: Bot,
    description: "Interactive voice-based learning assistant",
  },
  {
    title: "Spaced Repetition",
    href: "/tools/spaced-repetition",
    icon: Clock,
    description: "Optimize your learning with scheduled reviews",
  },
];
