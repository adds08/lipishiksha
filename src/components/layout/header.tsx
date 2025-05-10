import Link from 'next/link';
import { BookOpenText, Home, PenTool, ScanLine } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
          <BookOpenText className="h-7 w-7" />
          <span>Lipi Shiksha</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link href="/generator" className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1">
            <PenTool className="h-4 w-4" />
            Generator
          </Link>
          <Link href="/labeling" className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1">
            <ScanLine className="h-4 w-4" />
            Labeling
          </Link>
        </nav>
      </div>
    </header>
  );
}
