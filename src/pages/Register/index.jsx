import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { validateRegisterForm, hasErrors } from '../../utils/validators';
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

/** Registration page with client-side validation and mock account creation. */
export default function Register() {
  const { user, isLoading, register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
    const errors = validateRegisterForm(values);
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await register({
        name: values.name,
        email: values.email.trim(),
        password: values.password,
      });
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      setServerError(error?.message ?? 'Unable to create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-10 sm:py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join HimRakshak and start monitoring your zones.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {serverError && (
            <ErrorMessage title="Registration failed" message={serverError} onRetry={null} />
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Full name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Rishi Sharma"
              value={values.name}
              onChange={handleChange}
              error={fieldErrors.name}
            />
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
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={values.password}
              onChange={handleChange}
              error={fieldErrors.password}
            />
            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={values.confirmPassword}
              onChange={handleChange}
              error={fieldErrors.confirmPassword}
            />
            <Button type="submit" size="lg" loading={submitting} className="w-full">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to={ROUTES.LOGIN}
              className="rounded font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
