import { useState } from 'react';
import { Mail, ShieldCheck } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';
import { getInitials } from '../../utils/formatters';
import { validateName } from '../../utils/validators';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import ErrorMessage from '../../components/ui/ErrorMessage';

/** Account information plus a mock "edit name" form. */
export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name ?? '');
  const [nameError, setNameError] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const error = validateName(name);
    setNameError(error);
    if (error) return;

    setSaving(true);
    setServerError(null);
    try {
      const updated = await authService.updateProfile({ name });
      updateUser({ name: updated.name });
      toast.success('Profile updated');
    } catch (saveError) {
      setServerError(saveError?.message ?? 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your account details.</p>

      <div className="mt-6 space-y-6">
        <Card>
          <CardContent className="flex flex-col items-start gap-4 pt-6 sm:flex-row sm:items-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
              {getInitials(user?.name)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{user?.name}</h2>
                <Badge variant="info">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  {user?.role}
                </Badge>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" aria-hidden="true" />
                {user?.email}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit name</CardTitle>
            <CardDescription>Changes are saved to your mock profile</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {serverError && (
                <ErrorMessage title="Save failed" message={serverError} onRetry={null} />
              )}
              <Input
                label="Full name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError(null);
                }}
                error={nameError}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={user?.email ?? ''}
                disabled
                hint="Email cannot be changed in mock mode."
              />
              <div className="flex justify-end">
                <Button type="submit" loading={saving}>
                  Save changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
