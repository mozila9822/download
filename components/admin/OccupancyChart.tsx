'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { chartData } from "@/lib/data";

const chartConfig = {
  occupancy: {
    label: "Occupancy",
    color: "hsl(var(--chart-1))",
  },
}

export default function OccupancyChart() {
  return (
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: -20,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
           <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
            />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Area
            dataKey="total"
            type="natural"
            fill="var(--color-occupancy)"
            fillOpacity={0.4}
            stroke="var(--color-occupancy)"
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
  )
}

