export type RevenuePoint = {
  month: number;
  estPro: number;
  infPro: number;
  cabina: number;
  saloniPro: number;
};

export type Scenario = "conservative" | "realistic" | "optimistic";

export type CostConfig = {
  id: number;
  key: string;
  label: string;
  amount: number;
  frequency: number;
  start_month: number;
  end_month: number;
  color: string;
};

type XanoRevenueRow = {
  id: number;
  Mese: number | string;
  Rev_Estetiste_PRO: number | string;
  Rev_Influencer_PRO: number | string;
  Rev_Cabina_sharing: number | string;
  Rev_Saloni_PRO: number | string;
};

const DEFAULT_REVENUE_URL = "https://xbut-eryu-hhsg.f2.xano.io/api:ETPnqD9B/glowskill_revenues";
const DEFAULT_COST_URL = "https://xbut-eryu-hhsg.f2.xano.io/api:ETPnqD9B/gskiiicost";

const SCENARIO_MULTIPLIERS: Record<Scenario, number> = {
  conservative: 0.8,
  realistic: 1,
  optimistic: 1.2,
};

const toNumber = (value: number | string): number => {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const applyScenarioMultiplier = (data: RevenuePoint[], scenario: Scenario): RevenuePoint[] => {
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

const buildDemoData = (): RevenuePoint[] =>
  Array.from({ length: 24 }, (_, index) => {
    const month = index + 1;
    const estPro = month < 6 ? 0 : Math.round(200 * Math.log(month));
    const infPro = month < 12 ? 0 : Math.round(250 * Math.log(month - 10));
    const cabina = Math.round(500 * (1 / (1 + Math.exp(-0.35 * (month - 18)))));
    const saloniPro = month < 12 ? 0 : Math.round(month >= 18 ? (month - 11) * 90 : (month - 11) * 50);
    return { month, estPro, infPro, cabina, saloniPro };
  });

const mapXanoRowsToRevenuePoints = (rows: XanoRevenueRow[]): RevenuePoint[] =>
  rows
    .map((row) => ({
      month: toNumber(row.Mese),
      estPro: Math.round(toNumber(row.Rev_Estetiste_PRO)),
      infPro: Math.round(toNumber(row.Rev_Influencer_PRO)),
      cabina: Math.round(toNumber(row.Rev_Cabina_sharing)),
      saloniPro: Math.round(toNumber(row.Rev_Saloni_PRO)),
    }))
    .filter((row) => Number.isFinite(row.month) && row.month > 0)
    .sort((a, b) => a.month - b.month);

const getRevenueEndpoint = () => {
  if (process.env.NEXT_PUBLIC_XANO_REVENUE_URL) {
    return process.env.NEXT_PUBLIC_XANO_REVENUE_URL;
  }
  if (process.env.NEXT_PUBLIC_XANO_BASE) {
    return `${process.env.NEXT_PUBLIC_XANO_BASE.replace(/\/$/, "")}/glowskill_revenues`;
  }
  return DEFAULT_REVENUE_URL;
};

const getCostEndpoint = () => {
  if (process.env.NEXT_PUBLIC_XANO_COST_URL) {
    return process.env.NEXT_PUBLIC_XANO_COST_URL;
  }
  if (process.env.NEXT_PUBLIC_XANO_BASE) {
    return `${process.env.NEXT_PUBLIC_XANO_BASE.replace(/\/$/, "")}/gskiiicost`;
  }
  return DEFAULT_COST_URL;
};

export async function fetchRevenue(
  scenario: Scenario = "realistic",
): Promise<{ data: RevenuePoint[]; usedFallback: boolean }> {
  const fallback = applyScenarioMultiplier(buildDemoData(), scenario);

  const url = getRevenueEndpoint();
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Bad status: ${response.status}`);
    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
      throw new Error("Unexpected response shape");
    }
    const mapped = mapXanoRowsToRevenuePoints(payload as XanoRevenueRow[]);
    if (mapped.length === 0) {
      throw new Error("Empty revenue dataset");
    }
    return { data: applyScenarioMultiplier(mapped, scenario), usedFallback: false };
  } catch (error) {
    console.error("Failed to load revenue data", error);
    return { data: fallback, usedFallback: true };
  }
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

type XanoCostRow = {
  id: number;
  key: string;
  label: string;
  amount: number | string;
  frequency: number | string;
  start_month: number | string;
  end_month: number | string;
  color: string;
};

export async function fetchCostConfig(): Promise<CostConfig[]> {
  const url = getCostEndpoint();
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load cost config: ${response.status}`);
  }
  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error("Unexpected cost config response shape");
  }
  return (payload as XanoCostRow[])
    .map((row) => ({
      id: row.id,
      key: row.key,
      label: row.label,
      amount: toNumber(row.amount),
      frequency: Math.max(0, Math.floor(toNumber(row.frequency))),
      start_month: Math.max(1, Math.floor(toNumber(row.start_month))),
      end_month: Math.min(24, Math.floor(toNumber(row.end_month))),
      color: row.color,
    }))
    .filter((row) => row.key && row.label && Number.isFinite(row.amount));
}
