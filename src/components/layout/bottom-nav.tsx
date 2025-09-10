"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, ScanLine, ShieldAlert, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/navigation', label: 'Navigate', icon: Map },
  { href: '/detection', label: 'Detect', icon: ScanLine },
  { href: '/emergency', label: 'SOS', icon: ShieldAlert },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 shadow-t-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="grid h-16 w-full grid-cols-5 items-center justify-items-center">
        {navItems.map((item) => {
          const isActive = (pathname === '/' && item.href === '/') || (pathname !== '/' && item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary",
                isActive && "text-primary"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
