import { ReactNode } from "react";
import NavBar from '@/NavBar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}
