import { Link, useLocation } from "wouter";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription 
} from "@/components/ui/sheet";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  dashboardItems,
  learningModules,
  practiceItems,
  studyTools,
  type NavItem
} from "./nav-items";

interface MenuContentProps {
  items: NavItem[];
  className?: string;
}

interface MobileNavItemProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

interface ListItemProps {
  title: string;
  href: string;
  children: React.ReactNode;
  icon: LucideIcon;
}

/**
 * Renders a grid of navigation items with scrollable content
 */
const MenuContent = ({ items, className = "" }: MenuContentProps) => (
  <ul className={cn(
    "grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]",
    "max-h-[calc(100vh-200px)] overflow-y-auto",
    "scrollbar scrollbar-w-2 scrollbar-track-transparent",
    "scrollbar-thumb-primary scrollbar-thumb-rounded-lg",
    className
  )}
  role="menu"
  aria-label="Navigation menu items">
    {items.map((item) => (
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

/**
 * Mobile navigation item with click handler
 */
const MobileNavItem = ({ href, children, onClick }: MobileNavItemProps) => (
  <Link href={href}>
    <div
      className="block px-4 py-2 text-sm hover:bg-accent rounded-md cursor-pointer"
      onClick={onClick}
      role="menuitem"
    >
      {children}
    </div>
  </Link>
);

/**
 * Navigation list item with icon and description
 */
const ListItem = ({ title, href, children, icon: Icon }: ListItemProps) => (
  <li>
    <NavigationMenuLink asChild>
      <Link href={href}>
        <div
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
          )}
          role="menuitem"
        >
          <div className="flex items-center gap-2 text-sm font-medium leading-none">
            <Icon className="h-4 w-4" aria-hidden="true" />
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

/**
 * Main navigation bar component with mobile responsiveness
 */
export default function NavBar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b bg-white" role="navigation" aria-label="Main navigation">
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
                <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[300px] sm:w-[400px] overflow-hidden touch-auto"
              >
                <div className="h-[100dvh] flex flex-col">
                  <SheetHeader className="flex-shrink-0">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>
                      Access all NCLEX preparation resources
                    </SheetDescription>
                  </SheetHeader>
                  <nav 
                    className="flex-1 flex flex-col gap-4 mt-6 pb-20 overflow-y-auto px-1 touch-pan-y overscroll-contain"
                    style={{ 
                      WebkitOverflowScrolling: 'touch',
                      height: 'calc(100vh - 150px)',
                      maxHeight: 'calc(100dvh - 150px)'
                    }}
                    role="menu"
                    aria-label="Mobile navigation menu"
                  >
                    {[
                      { title: "Dashboards", items: dashboardItems },
                      { title: "Learning Modules", items: learningModules },
                      { title: "Practice & Simulation", items: practiceItems },
                      { title: "Study Tools", items: studyTools }
                    ].map(({ title, items }) => (
                      <div key={title} className="px-4 py-2" role="group" aria-label={title}>
                        <h3 className="mb-2 text-sm font-semibold">{title}</h3>
                        <div className="space-y-1">
                          {items.map((item) => (
                            <MobileNavItem
                              key={item.title}
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                            >
                              <div className="flex items-center gap-2">
                                <item.icon className="h-4 w-4" aria-hidden="true" />
                                <span>{item.title}</span>
                              </div>
                            </MobileNavItem>
                          ))}
                        </div>
                      </div>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}