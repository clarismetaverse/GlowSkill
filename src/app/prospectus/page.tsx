"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FileDown, RefreshCw } from "lucide-react";

import { ScenarioSelect } from "@/components/ScenarioSelect";
import { RevenueByStreamChart } from "@/components/charts/RevenueByStream";
import { CostHistogram } from "@/components/charts/CostHistogram";
import { TotalRevenueChart } from "@/components/charts/TotalRevenue";
import { ProspectusCopy } from "@/components/ProspectusCopy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchKpis, fetchRevenue, type RevenuePoint, type Scenario } from "@/lib/api";

export default function ProspectusPage() {
  const [scenario, setScenario] = useState<Scenario>("realistic");
  const [data, setData] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<Record<string, number> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async (selectedScenario: Scenario) => {
    setLoading(true);
    setError(null);
    try {
      const [revenueResult, summary] = await Promise.all([
        fetchRevenue(selectedScenario),
        fetchKpis(),
      ]);
      setData(revenueResult.data);
      setKpis(summary);
      if (revenueResult.usedFallback) {
        setError("Unable to load data from Xano. Showing demo data.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load data from Xano. Showing demo data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(scenario);
  }, [loadData, scenario]);

  const handleRefresh = useCallback(() => {
    loadData(scenario);
  }, [loadData, scenario]);

  const handleExportPdf = useCallback(async () => {
    if (!containerRef.current) return;
    const canvas = await html2canvas(containerRef.current, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
    const width = imgProps.width * ratio;
    const height = imgProps.height * ratio;
    const marginX = (pageWidth - width) / 2;
    const marginY = (pageHeight - height) / 2;

    pdf.addImage(imgData, "PNG", marginX, marginY, width, height);
    pdf.save(`glowskill-prospectus-${scenario}.pdf`);
  }, [scenario]);

  const headlineKpis = useMemo(() => {
    if (!kpis) return null;
    const mapping: Record<string, string> = {
      stylists: "Estetiste",
      salons: "Saloni",
      proStylists: "Estetiste PRO",
      proInfluencers: "Influencer PRO",
      bookingsMonth24: "Cabina prenot./mese 24",
    };
    return Object.entries(mapping)
      .filter(([key]) => typeof kpis[key] === "number")
      .map(([key, label]) => ({
        key,
        label,
        value: kpis[key].toLocaleString(),
      }));
  }, [kpis]);

  return (
    <div ref={containerRef} className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Glowskill Prospectus &amp; Revenue Dashboard</h1>
        <p className="text-sm text-muted-foreground">Early-stage plan • 24 months • Xano-connected</p>
      </header>

      <div className="flex flex-wrap items-center gap-4">
        <ScenarioSelect value={scenario} onChange={setScenario} />
        <Button variant="outline" onClick={handleRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        <Button onClick={handleExportPdf} className="gap-2">
          <FileDown className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {headlineKpis && headlineKpis.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Key KPIs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-5">
            {headlineKpis.map((item) => (
              <div key={item.key} className="rounded-lg bg-muted/60 p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-lg border border-dashed border-amber-400 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <RevenueByStreamChart data={data} loading={loading} error={error} />
        <TotalRevenueChart data={data} />
        <div className="md:col-span-2">
          <CostHistogram />
        </div>
      </div>

      <ProspectusCopy />
    </div>
  );
}
