import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 shadow-sm backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block font-headline">
              DRISHTI
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
