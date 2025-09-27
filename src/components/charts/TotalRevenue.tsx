"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchCostConfig } from "@/lib/api";
import type { CostConfig, RevenuePoint } from "@/lib/api";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type TotalRevenueChartProps = {
  data: RevenuePoint[];
};

const toRevenueSeries = (points: RevenuePoint[]) =>
  points.map((point) => ({
    month: point.month,
    revenue: point.estPro + point.infPro + point.cabina + point.saloniPro,
  }));

const amountForMonth = (config: CostConfig, month: number) => {
  const end = Math.min(24, config.end_month ?? 24);
  if (month < config.start_month || month > end) return 0;
  if (config.frequency === 0) {
    return month === config.start_month ? config.amount : 0;
  }
  if (config.frequency === 1) {
    return config.amount;
  }
  return (month - config.start_month) % config.frequency === 0 ? config.amount : 0;
};

export function TotalRevenueChart({ data }: TotalRevenueChartProps) {
  const [costConfig, setCostConfig] = useState<CostConfig[] | null>(null);
  const [costError, setCostError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const config = await fetchCostConfig();
        setCostConfig(config);
        setCostError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load costs";
        setCostError(message);
        setCostConfig(null);
      }
    })();
  }, []);

  const revenueSeries = useMemo(() => toRevenueSeries(data), [data]);

  const costSeries = useMemo(() => {
    const configs = costConfig ?? [];
    return Array.from({ length: 24 }, (_, index) => {
      const month = index + 1;
      const cost = configs.reduce((total, config) => total + amountForMonth(config, month), 0);
      return { month, cost };
    });
  }, [costConfig]);

  const mergedSeries = useMemo(() => {
    const revenueByMonth = new Map<number, number>();
    for (const entry of revenueSeries) {
      revenueByMonth.set(entry.month, entry.revenue);
    }

    return costSeries.map(({ month, cost }) => ({
      month,
      revenue: revenueByMonth.get(month) ?? 0,
      cost,
    }));
  }, [costSeries, revenueSeries]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Total Revenue</CardTitle>
        <p className="text-sm text-muted-foreground">Aggregate monthly revenue (EUR)</p>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mergedSeries} margin={{ top: 16, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} width={80} />
            <Tooltip formatter={(value: number) => `€${Number(value).toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#1F2937" strokeWidth={2} dot={false} />
            <Line
              type="monotone"
              dataKey="cost"
              name="Costs"
              stroke="#DC2626"
              strokeDasharray="4 4"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
        {costError && <p className="mt-2 text-xs text-red-600">{costError}</p>}
      </CardContent>
    </Card>
  );
}
