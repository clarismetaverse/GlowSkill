"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { fetchCostConfig, type CostConfig } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BUCKETS = [
  { start: 1, end: 4 },
  { start: 5, end: 8 },
  { start: 9, end: 12 },
  { start: 13, end: 16 },
  { start: 17, end: 20 },
  { start: 21, end: 24 },
] as const;

type CostMode = "sum" | "average";

type CostSeries = {
  key: string;
  label: string;
  color: string;
  monthly: number[];
};

type ChartRow = {
  bucket: string;
  [key: string]: number | string;
};

const MODE_LABELS: Record<CostMode, string> = {
  sum: "Sum (4 mesi)",
  average: "Media mensile",
};

const formatBucket = (start: number, end: number) => `${start}–${end}`;

const formatCurrency = (value: number, mode: CostMode) => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: mode === "sum" ? 0 : 2,
  });
  return formatter.format(value);
};

const expandConfigToSeries = (config: CostConfig): CostSeries => {
  const monthly = Array.from({ length: 24 }, () => 0);
  for (let month = 1; month <= 24; month += 1) {
    if (month < config.start_month || month > config.end_month) continue;
    if (config.frequency === 0) {
      if (month === config.start_month) {
        monthly[month - 1] = config.amount;
      }
      continue;
    }
    if (config.frequency === 1) {
      monthly[month - 1] = config.amount;
      continue;
    }
    if ((month - config.start_month) % config.frequency === 0) {
      monthly[month - 1] = config.amount;
    }
  }
  return {
    key: config.key,
    label: config.label,
    color: config.color,
    monthly,
  };
};

const aggregateBuckets = (series: CostSeries[], mode: CostMode): ChartRow[] => {
  if (series.length === 0) return [];
  return BUCKETS.map(({ start, end }) => {
    const bucketLabel = formatBucket(start, end);
    const divisor = end - start + 1;
    const row: ChartRow = { bucket: bucketLabel };
    series.forEach((item) => {
      const slice = item.monthly.slice(start - 1, end);
      const sum = slice.reduce((acc, value) => acc + value, 0);
      const value = mode === "sum" ? sum : Number((sum / divisor).toFixed(2));
      row[item.key] = value;
    });
    return row;
  });
};

export function CostHistogram() {
  const [mode, setMode] = useState<CostMode>("sum");
  const [costs, setCosts] = useState<CostConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchCostConfig();
        if (active) {
          setCosts(result);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError("Unable to load cost configuration from Xano.");
          setCosts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const series = useMemo(() => costs.map(expandConfigToSeries), [costs]);

  const chartData = useMemo(() => aggregateBuckets(series, mode), [mode, series]);

  const labelMap = useMemo(() => {
    const map: Record<string, string> = {};
    series.forEach((item) => {
      map[item.key] = item.label;
    });
    return map;
  }, [series]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl">Cost Split Histogram (First 24 Months)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Toggle between total cost per 4-month bucket and the corresponding monthly average.
          </p>
        </div>
        <Select value={mode} onValueChange={(value) => setMode(value as CostMode)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MODE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-[360px]">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading cost data…
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center text-center text-sm text-destructive">
              {error}
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No cost data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bucket" tickLine={false} axisLine={false} />
                <YAxis
                  width={80}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => formatCurrency(value, mode)}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value, mode),
                    labelMap[name] ?? name,
                  ]}
                  labelFormatter={(label) => `Mesi ${label}`}
                />
                <Legend formatter={(value) => labelMap[value] ?? value} />
                {series.map((item) => (
                  <Bar key={item.key} dataKey={item.key} name={item.label} stackId="costs" fill={item.color} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Fetched from Xano: <code>/gskiiicost</code>. Frontend applies frequency rules and aggregates in 4-month
          buckets.
        </p>
      </CardContent>
    </Card>
  );
}
