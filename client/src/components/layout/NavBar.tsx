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

interface NavItem {
  title: string;
  href: string;
  icon: any; // Replace with specific Lucide icon type if available
  description: string;
}

const dashboardItems: NavItem[] = [
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

const learningModules: NavItem[] = [
  {
    title: "Management of Care",
    href: "/modules/management-of-care",
    icon: Users,
    description: "Master care coordination and delegation skills",
  },
  {
    title: "Safety & Infection Control",
    href: "/modules/safety-infection-control",
    icon: Shield,
    description: "Learn safety protocols and infection prevention",
  },
  {
    title: "Health Promotion",
    href: "/modules/health-promotion",
    icon: HeartPulse,
    description: "Study preventive care and health maintenance",
  },
  {
    title: "Basic Care & Comfort",
    href: "/modules/basic-care",
    icon: Heart,
    description: "Master fundamental nursing skills and comfort measures",
  },
  {
    title: "Psychosocial Integrity",
    href: "/modules/psychosocial-integrity",
    icon: Brain,
    description: "Master mental health and therapeutic communication",
  },
  {
    title: "Clinical Analysis",
    href: "/modules/clinical-analysis",
    icon: Stethoscope,
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
    title: "Pharmacology",
    href: "/modules/pharmacology",
    icon: Beaker,
    description: "Study medications and drug administration",
  },
  {
    title: "Management of Care",
    href: "/modules/management-of-care",
    icon: Users,
    description: "Learn care coordination and patient advocacy",
  },
  {
    title: "Safety & Infection Control",
    href: "/modules/safety-infection-control",
    icon: Shield,
    description: "Master safety protocols and infection prevention",
  },
  {
    title: "Health Promotion",
    href: "/modules/health-promotion",
    icon: Heart,
    description: "Study preventive care and wellness strategies",
  },
  {
    title: "Psychosocial Integrity",
    href: "/modules/psychosocial-integrity",
    icon: Brain,
    description: "Learn mental health and therapeutic communication",
  },
  {
    title: "Basic Care & Comfort",
    href: "/modules/basic-care",
    icon: Home,
    description: "Master fundamental nursing skills",
  },
  {
    title: "Pharmacology",
    href: "/modules/pharmacology",
    icon: Pill,
    description: "Study medications and drug administration",
  },
  {
    title: "Risk Reduction",
    href: "/modules/risk-reduction",
    icon: AlertTriangle,
    description: "Learn to identify and minimize patient risks",
  },
  {
    title: "Clinical Analysis",
    href: "/modules/clinical-analysis",
    icon: Microscope,
    description: "Develop critical thinking skills",
  },
  {
    title: "Clinical Judgment",
    href: "/modules/clinical-judgment",
    icon: Scale,
    description: "Master evidence-based decision making",
  },
  {
    title: "Drug Calculations",
    href: "/modules/calculations",
    icon: Calculator,
    description: "Practice medication dosage calculations",
  },
  {
    title: "Pathophysiology",
    href: "/modules/pathophysiology",
    icon: Activity,
    description: "Study disease processes and body systems",
  }
];

const practiceItems: NavItem[] = [
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

const studyTools: NavItem[] = [
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

interface MenuContentProps {
  items: NavItem[];
  className?: string;
}

interface MobileNavItemProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function NavBar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const MenuContent = ({ items, className = "" }: MenuContentProps) => (
    <ul className={cn(
      "grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]",
      "max-h-[calc(100vh-200px)] overflow-y-auto",
      "scrollbar scrollbar-w-2 scrollbar-track-transparent",
      "scrollbar-thumb-primary scrollbar-thumb-rounded-lg",
      className
    )}>
      {items.map((item: NavItem) => (
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
  );

  const MobileNavItem = ({ href, children, onClick }: MobileNavItemProps) => (
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
                    <MenuContent items={dashboardItems} />
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Learning Modules</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <MenuContent items={learningModules} />
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Practice & Simulation</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <MenuContent items={practiceItems} />
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Study Tools</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <MenuContent items={studyTools} />
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
                <nav className="flex flex-col gap-4 mt-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                  {[
                    { title: "Dashboards", items: dashboardItems },
                    { title: "Learning Modules", items: learningModules },
                    { title: "Practice & Simulation", items: practiceItems },
                    { title: "Study Tools", items: studyTools }
                  ].map(({ title, items }) => (
                    <div key={title} className="px-4 py-2">
                      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
                      {items.map((item) => (
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
                  ))}
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
  icon: any; // Replace with specific Lucide icon type if available
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