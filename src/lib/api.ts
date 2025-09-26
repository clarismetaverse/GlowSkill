export type RevenuePoint = {
  month: number;
  estPro: number;
  infPro: number;
  cabina: number;
  saloniPro: number;
};

export type Scenario = "conservative" | "realistic" | "optimistic";

const SCENARIO_MULTIPLIERS: Record<Scenario, number> = {
  conservative: 0.8,
  realistic: 1,
  optimistic: 1.2,
};

const buildDemoData = (): RevenuePoint[] =>
  Array.from({ length: 24 }, (_, index) => {
    const month = index + 1;
    const estPro = month < 6 ? 0 : Math.round(200 * Math.log(month));
    const infPro = month < 12 ? 0 : Math.round(250 * Math.log(month - 10));
    const cabina = Math.round(500 * (1 / (1 + Math.exp(-0.35 * (month - 18)))));
    const saloniPro = month < 12 ? 0 : Math.round(month >= 18 ? (month - 11) * 90 : (month - 11) * 50);
    return { month, estPro, infPro, cabina, saloniPro };
  });

const scaleDemoData = (data: RevenuePoint[], scenario: Scenario) => {
  const multiplier = SCENARIO_MULTIPLIERS[scenario];
  if (multiplier === 1) return data;
  return data.map((point) => ({
    ...point,
    estPro: Math.round(point.estPro * multiplier),
    infPro: Math.round(point.infPro * multiplier),
    cabina: Math.round(point.cabina * multiplier),
    saloniPro: Math.round(point.saloniPro * multiplier),
  }));
};

export async function fetchRevenue(scenario: Scenario = "realistic"): Promise<RevenuePoint[]> {
  const base = process.env.NEXT_PUBLIC_XANO_BASE;
  const fallback = scaleDemoData(buildDemoData(), scenario);
  if (!base) return fallback;

  const url = `${base.replace(/\/$/, "")}/revenue/streams?scenario=${scenario}`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Bad status");
    const data: unknown = await response.json();
    if (Array.isArray(data) && data.length) {
      return data as RevenuePoint[];
    }
  } catch (error) {
    console.error("Failed to load revenue data", error);
  }
  return fallback;
}

export async function fetchKpis(): Promise<Record<string, number> | null> {
  const base = process.env.NEXT_PUBLIC_XANO_BASE;
  if (!base) return null;
  const url = `${base.replace(/\/$/, "")}/kpi/summary`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Bad status");
    const data = await response.json();
    return data as Record<string, number>;
  } catch (error) {
    console.error("Failed to load KPI summary", error);
    return null;
  }
}
