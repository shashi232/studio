import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ThemeToggle from '@/components/settings/theme-toggle';
import { Waves, Bell } from 'lucide-react';

const alertPatterns = [
    { name: 'Obstacle: HIGH', pattern: 'Three short, strong pulses' },
    { name: 'Obstacle: MEDIUM', pattern: 'Two medium pulses' },
    { name: 'Hazard: Step', pattern: 'Continuous low vibration' },
    { name: 'Hazard: Uneven Surface', pattern: 'Intermittent gentle pulses' },
    { name: 'Low Battery', pattern: 'Long pulse every minute' },
];

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold text-primary">Settings</h1>
        <p className="text-muted-foreground">Customize your DRISHTI experience.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Adjust the look and feel of the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Alert Patterns</CardTitle>
          <CardDescription>Familiarize yourself with the alert vibrations.</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-4">
              {alertPatterns.map((alert) => (
                <li key={alert.name} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                     <div className="bg-muted rounded-full p-2">
                      <Bell className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-semibold">{alert.name}</p>
                  </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                    <Waves className="h-4 w-4" />
                    <p className="text-sm">{alert.pattern}</p>
                  </div>
                </li>
              ))}
            </ul>
        </CardContent>
      </Card>

    </div>
  );
}
