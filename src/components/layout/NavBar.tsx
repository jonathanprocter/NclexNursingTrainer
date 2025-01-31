import { Link } from "wouter";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "../ui/navigation-menu";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { useState, useEffect } from "react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "View your study progress and analytics",
  },
  {
    title: "Study Guide",
    href: "/study-guide",
    description: "Access comprehensive study materials",
  },
  {
    title: "Practice",
    href: "/practice",
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
      <a
        className={`block px-4 py-2 text-sm hover:bg-accent rounded-md cursor-pointer ${
          currentPath === href ? 'bg-accent text-accent-foreground' : 'text-foreground'
        }`}
        onClick={onClick}
      >
        {children}
      </a>
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <a className="text-xl font-bold text-primary">NCLEX Prep</a>
          </Link>

          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <Link href={item.href}>
                      <a
                        className={`block px-4 py-2 text-sm rounded-md cursor-pointer ${
                          currentPath === item.href
                            ? 'bg-accent text-accent-foreground'
                            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        {item.title}
                      </a>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="md:hidden">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Navigation</DialogTitle>
                  <DialogDescription>
                    Access all NCLEX preparation resources
                  </DialogDescription>
                </DialogHeader>
                <nav className="mt-6">
                  {navItems.map((item) => (
                    <MobileNavItem
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.title}
                    </MobileNavItem>
                  ))}
                </nav>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </nav>
  );
}