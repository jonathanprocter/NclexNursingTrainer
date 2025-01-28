import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Home } from "lucide-react";

export default function NavBar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/questions", label: "Question Bank", icon: Brain },
    { href: "/study-guide", label: "Study Guide", icon: BookOpen },
  ];

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">NCLEX Prep</h1>
            <div className="hidden md:flex md:space-x-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "default" : "ghost"}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="md:hidden flex space-x-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "default" : "ghost"}
                  size="icon"
                >
                  <item.icon className="h-4 w-4" />
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
