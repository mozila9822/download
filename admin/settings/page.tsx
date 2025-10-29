import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage application settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Settings interface will be here.</p>
      </CardContent>
    </Card>
  );
}
