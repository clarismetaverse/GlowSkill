"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenuePoint } from "@/lib/api";

export type RevenueByStreamProps = {
  data: RevenuePoint[];
  loading: boolean;
  error: string | null;
};

export function RevenueByStreamChart({ data, loading, error }: RevenueByStreamProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Revenue by Stream</CardTitle>
        <p className="text-sm text-muted-foreground">Monthly revenue per stream (EUR)</p>
      </CardHeader>
      <CardContent className="h-[320px]">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading revenue data…
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-destructive">
            Unable to load from Xano. Displaying fallback demo data.
          </div>
        ) : null}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} width={80} />
            <Tooltip formatter={(value: number, name: string) => [`€${value.toLocaleString()}`, name]} />
            <Legend />
            <Line type="monotone" dataKey="estPro" name="Estetiste PRO" stroke="#6366F1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="infPro" name="Influencer/UGC PRO" stroke="#22C55E" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="cabina" name="Cabina-sharing" stroke="#F97316" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="saloniPro" name="Saloni PRO" stroke="#14B8A6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
