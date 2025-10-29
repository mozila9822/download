import type { AdminStat } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  stat: AdminStat;
};

export default function StatCard({ stat }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
        <stat.icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
        <p
          className={cn(
            'text-xs text-muted-foreground',
            stat.changeType === 'increase'
              ? 'text-green-600'
              : 'text-red-600'
          )}
        >
          {stat.change}
        </p>
      </CardContent>
    </Card>
  );
}
