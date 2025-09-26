"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenuePoint } from "@/lib/api";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type TotalRevenueChartProps = {
  data: RevenuePoint[];
};

const toTotalSeries = (points: RevenuePoint[]) =>
  points.map((point) => ({
    month: point.month,
    total: point.estPro + point.infPro + point.cabina + point.saloniPro,
  }));

export function TotalRevenueChart({ data }: TotalRevenueChartProps) {
  const totalSeries = toTotalSeries(data);
  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Total Revenue</CardTitle>
        <p className="text-sm text-muted-foreground">Aggregate monthly revenue (EUR)</p>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={totalSeries} margin={{ top: 16, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} width={80} />
            <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, "Totale" as const]} />
            <Line type="monotone" dataKey="total" stroke="#1F2937" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
