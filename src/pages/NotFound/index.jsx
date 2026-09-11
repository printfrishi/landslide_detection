import { Link } from 'react-router-dom';
import { Mountain } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../constants/routes';

/** Standalone 404 page (rendered outside any layout). */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Mountain className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="mt-8 text-6xl font-bold tabular-nums tracking-tight">404</p>
      <h1 className="mt-3 text-xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The page you are looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button to={ROUTES.HOME}>Go to home</Button>
        <Button variant="outline" to={ROUTES.DASHBOARD}>
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}
