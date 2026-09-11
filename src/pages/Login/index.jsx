import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Info, X } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { validateLoginForm, hasErrors } from '../../utils/validators';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';

/** Sign-in page with client-side validation, error banner, and mock-mode notice. */
export default function Login() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || ROUTES.DASHBOARD;

  const [values, setValues] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [mockNoticeVisible, setMockNoticeVisible] = useState(true);

  // While the session is being restored, hold here to avoid a redirect flicker.
  if (isLoading) {
    return <Spinner fullPage size="lg" label="Checking your session…" />;
  }
  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateLoginForm(values);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await login({ email: values.email.trim(), password: values.password });
      navigate(from, { replace: true });
    } catch (error) {
      setServerError(error?.message ?? 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-10 sm:py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to access the HimRakshak dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockNoticeVisible && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-600/25 bg-amber-50 p-3" role="status">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              <p className="flex-1 text-sm text-amber-800">
                <strong className="font-semibold">Mock mode — no backend connected.</strong> Any
                valid email and a password of at least 6 characters will sign you in.
              </p>
              <button
                type="button"
                onClick={() => setMockNoticeVisible(false)}
                aria-label="Dismiss notice"
                className="-m-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-amber-600 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {serverError && (
            <ErrorMessage title="Sign in failed" message={serverError} onRetry={null} />
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={handleChange}
              error={fieldErrors.email}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••"
              value={values.password}
              onChange={handleChange}
              error={fieldErrors.password}
            />
            <Button type="submit" size="lg" loading={submitting} className="w-full">
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              to={ROUTES.REGISTER}
              state={location.state}
              className="rounded font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
