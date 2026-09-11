import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mountain, Menu, X } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { Button } from '../ui/Button';

/** Logo + wordmark, shared by the public navbar, sidebar, and footer. */
export function BrandMark({ to = ROUTES.HOME }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label="HimRakshak home"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Mountain className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-lg font-bold tracking-tight">HimRakshak</span>
    </Link>
  );
}

/** Sticky public navbar with Sign in / Get Started and a mobile hamburger menu. */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <BrandMark />
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" to={ROUTES.LOGIN}>
            Sign in
          </Button>
          <Button to={ROUTES.REGISTER}>Get Started</Button>
        </div>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="public-mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </nav>
      {menuOpen && (
        <div
          id="public-mobile-menu"
          className="space-y-2 border-t bg-background px-4 pb-4 pt-3 md:hidden"
        >
          <Button
            variant="outline"
            to={ROUTES.LOGIN}
            className="w-full"
            onClick={() => setMenuOpen(false)}
          >
            Sign in
          </Button>
          <Button
            to={ROUTES.REGISTER}
            className="w-full"
            onClick={() => setMenuOpen(false)}
          >
            Get Started
          </Button>
        </div>
      )}
    </header>
  );
}
