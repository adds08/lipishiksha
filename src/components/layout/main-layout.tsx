import type { ReactNode } from 'react';
import { Header } from './header';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-card border-t py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Lipi Shiksha. All rights reserved.
      </footer>
    </div>
  );
}
