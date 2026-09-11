import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import Spinner from '../ui/Spinner';

/**
 * Gate for protected routes. While the session is being restored it shows a
 * full-page spinner (prevents redirect flicker); when unauthenticated it
 * redirects to /login remembering where the user wanted to go.
 */
export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Spinner fullPage size="lg" label="Checking your session…" />;
  }
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  }
  return children;
}
