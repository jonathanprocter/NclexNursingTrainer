import { Link } from "wouter";

export default function NavBar() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/">
            <a className="text-xl font-bold">NCLEX Prep</a>
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/dashboard">
              <a className="text-sm hover:text-primary">Dashboard</a>
            </Link>
            <Link href="/practice">
              <a className="text-sm hover:text-primary">Practice</a>
            </Link>
            <Link href="/study-guide">
              <a className="text-sm hover:text-primary">Study Guide</a>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
