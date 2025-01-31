import { Link, useLocation } from "wouter";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Brain,
  LineChart,
  Beaker,
  HeartPulse,
  Shield,
  Scale,
  Calculator,
  Activity,
  GraduationCap,
  TestTube,
  UserSquare2,
  Stethoscope,
  Bot,
  Clock,
  Menu,
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription 
} from "@/components/ui/sheet";
import { useState } from "react";

const dashboardItems = [
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

const learningModules = [
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

const practiceItems = [
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

const studyTools = [
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

export default function NavBar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const MobileNavItem = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <Link href={href}>
      <div
        className="block px-4 py-2 text-sm hover:bg-accent rounded-md cursor-pointer"
        onClick={onClick}
      >
        {children}
      </div>
    </Link>
  );

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <h1 className="text-xl font-bold text-primary cursor-pointer">NCLEX Prep</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Dashboards</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] max-h-[80vh] overflow-y-auto gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] scrollbar-thin scrollbar-thumb-accent">
                      {dashboardItems.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Learning Modules</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] max-h-[80vh] overflow-y-auto gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] scrollbar-thin scrollbar-thumb-accent">
                      {learningModules.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Practice & Simulation</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] max-h-[80vh] overflow-y-auto gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] scrollbar-thin scrollbar-thumb-accent">
                      {practiceItems.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Study Tools</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] max-h-[80vh] overflow-y-auto gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] scrollbar-thin scrollbar-thumb-accent">
                      {studyTools.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>
                    Access all NCLEX preparation resources
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  <div className="px-4 py-2">

                    {dashboardItems.map((item) => (
                      <MobileNavItem
                        key={item.title}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                      </MobileNavItem>
                    ))}
                  </div>

                  <div className="px-4 py-2">

                    {learningModules.map((item) => (
                      <MobileNavItem
                        key={item.title}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                      </MobileNavItem>
                    ))}
                  </div>

                  <div className="px-4 py-2">

                    {practiceItems.map((item) => (
                      <MobileNavItem
                        key={item.title}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                      </MobileNavItem>
                    ))}
                  </div>

                  <div className="px-4 py-2">

                    {studyTools.map((item) => (
                      <MobileNavItem
                        key={item.title}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                      </MobileNavItem>
                    ))}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

interface ListItemProps {
  title: string;
  href: string;
  children: React.ReactNode;
  icon: any;
}

function ListItem({ title, href, children, icon: Icon }: ListItemProps) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
            )}
          >
            <div className="flex items-center gap-2 text-sm font-medium leading-none">
              <Icon className="h-4 w-4" />
              {title}
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}