import { Link } from "wouter";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  LineChart,
  BookOpen,
  Brain,
  Menu,
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription 
} from "../ui/sheet";
import { useState, useEffect } from "react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LineChart,
    description: "View your study progress and analytics",
  },
  {
    title: "Study Guide",
    href: "/study-guide",
    icon: BookOpen,
    description: "Access comprehensive study materials",
  },
  {
    title: "Practice",
    href: "/practice",
    icon: Brain,
    description: "Take practice tests and quizzes",
  },
];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const updatePath = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', updatePath);
    return () => window.removeEventListener('popstate', updatePath);
  }, []);

  const MobileNavItem = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <Link href={href}>
      <div
        className={cn(
          "block px-4 py-2 text-sm hover:bg-accent rounded-md cursor-pointer",
          currentPath === href && "bg-accent text-accent-foreground"
        )}
        onClick={onClick}
      >
        {children}
      </div>
    </Link>
  );

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <h1 className="text-xl font-bold text-primary cursor-pointer">NCLEX Prep</h1>
          </Link>

          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <Link href={item.href}>
                      <div
                        className={cn(
                          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer",
                          currentPath.startsWith(item.href) && "bg-accent text-accent-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 text-sm font-medium leading-none">
                          <item.icon className="h-4 w-4" />
                          {item.title}
                        </div>
                      </div>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost">
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
                  {navItems.map((item) => (
                    <MobileNavItem
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                    </MobileNavItem>
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