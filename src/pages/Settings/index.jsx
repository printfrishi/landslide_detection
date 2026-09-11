import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/Switch';

const INITIAL_PREFERENCES = [
  {
    id: 'email-alerts',
    title: 'Email notifications',
    description: 'Receive risk alerts by email as soon as they are raised.',
    enabled: true,
  },
  {
    id: 'sms-alerts',
    title: 'SMS notifications',
    description: 'Get critical alerts by SMS for on-call response teams.',
    enabled: false,
  },
  {
    id: 'critical-only',
    title: 'Critical alerts only',
    description: 'Suppress Low and Moderate alerts; only High and Critical come through.',
    enabled: false,
  },
  {
    id: 'weekly-digest',
    title: 'Weekly summary digest',
    description: 'A weekly email recap of sensor readings and zone risk changes.',
    enabled: true,
  },
];

/** Placeholder notification preferences with a mock save. */
export default function Settings() {
  const toast = useToast();
  const [preferences, setPreferences] = useState(INITIAL_PREFERENCES);
  const [saving, setSaving] = useState(false);

  const togglePreference = (id) => {
    setPreferences((current) =>
      current.map((pref) => (pref.id === id ? { ...pref, enabled: !pref.enabled } : pref))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO(backend): PUT /api/users/notification-preferences
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success('Preferences saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Placeholder notification preferences — saving is mocked until the backend exists.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
          <CardDescription>How and when alerts reach you</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {preferences.map(({ id, title, description, enabled }) => (
              <li key={id} className="flex items-start justify-between gap-4 px-6 py-4">
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={() => togglePreference(id)}
                  aria-label={`${title} preference`}
                />
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="justify-end border-t">
          <Button onClick={handleSave} loading={saving}>
            Save preferences
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
