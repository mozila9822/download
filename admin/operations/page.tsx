import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function OperationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Operations</CardTitle>
        <CardDescription>
          Manage housekeeping, maintenance, and other operations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Operations management interface will be here.</p>
      </CardContent>
    </Card>
  );
}
