'use client';

import * as React from 'react';
import { TrendingUp } from "lucide-react"
import { Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {pieChartData as chartData} from '@/lib/data';


const chartConfig = {
  bookings: {
    label: "Bookings",
  },
  flights: {
    label: "Flights",
    color: "hsl(var(--chart-1))",
  },
  hotels: {
    label: "Hotels",
    color: "hsl(var(--chart-2))",
  },
  tours: {
    label: "Tours",
    color: "hsl(var(--chart-3))",
  },
  coach: {
    label: "Coach",
    color: "hsl(var(--chart-4))",
  },
}

export default function BookingChart() {
    const totalValue = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.value, 0)
    }, [])

  return (
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            strokeWidth={5}
          >
             {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
  )
}
