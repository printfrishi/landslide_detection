import { Link } from 'react-router-dom';
import { LogOut, Menu, Settings, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { getInitials } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';

function InitialsAvatar({ name }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
      {getInitials(name)}
    </span>
  );
}

/** Sticky dashboard topbar: hamburger (mobile), user info + avatar + logout. */
export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('You have been signed out.');
    } catch {
      toast.error('Could not sign out. Please try again.');
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-end gap-3 border-b bg-background/95 backdrop-blur px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="mr-auto inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Desktop: full user info + avatar + logout icon button */}
      <div className="hidden text-right lg:block">
        <p className="text-sm font-medium leading-tight">{user?.name}</p>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
      </div>
      <div className="hidden lg:block">
        <InitialsAvatar name={user?.name} />
      </div>
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Log out"
        className="hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:inline-flex"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Mobile/tablet: avatar opens a shadcn dropdown account menu */}
      <div className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Account menu"
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <InitialsAvatar name={user?.name} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block truncate">{user?.name}</span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {user?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={ROUTES.PROFILE}>
                <User aria-hidden="true" />
                Your profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={ROUTES.SETTINGS}>
                <Settings aria-hidden="true" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut aria-hidden="true" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
