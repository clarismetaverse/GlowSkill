import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProspectusCopy() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Prospectus</CardTitle>
        <p className="text-sm text-muted-foreground">
          Vision, revenue streams, costs, metrics, and milestones guiding the 24-month roadmap.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-base font-semibold">Vision &amp; Product</h3>
          <p>
            Glowskill connette <strong>freelancer beauty</strong>, <strong>saloni</strong> e <strong>creator</strong> in un ecosistema
            dove le prenotazioni evolvono in <em>collab sessions</em> con milestone narrative. La piattaforma è dual-mode
            (Freelancer ↔ Influencer), integra <em>cabina-sharing</em> stile Airbnb per cabine dei centri e abilita portfolio/storytelling utili a brand e clienti.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Revenue Streams</h3>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong>Cabina-sharing:</strong> fee per booking (es. €10). Plateau a 24 mesi: <strong>top 30 saloni = 2
              prenot./giorno</strong>, gli altri al <strong>20%</strong> di quel volume (regola di Pareto).
            </li>
            <li>
              <strong>Estetiste PRO</strong> (<em>dal mese 6</em>): €10/mese; conversione target <strong>20%</strong> degli iscritti.
            </li>
            <li>
              <strong>Influencer/UGC PRO</strong> (<em>dal mese 12</em>): €15/mese; conversione target <strong>20%</strong> dei creator attivi.
            </li>
            <li>
              <strong>Saloni PRO</strong> (<em>adozione progressiva</em>): prezzo mensile (79–99€). Nel modello base: <strong>€99</strong> con
              conversione che cresce <strong>0%→5% (mesi 12–14) → 15% (15–17) → 30–40% (18–24)</strong>.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Cost Structure</h3>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong>Sviluppo:</strong> €600/mese × 5 mesi; poi continuous improvement.
            </li>
            <li>
              <strong>Infra &amp; AI:</strong> ~€200/mese (token AI, Xano, server).
            </li>
            <li>
              <strong>Customer Support:</strong> €400/mese (ENG) o €900/mese (IT–Albania); 1–2 persone per 4 mesi.
            </li>
            <li>
              <strong>Amministrazione/Legale:</strong> €1.500 una tantum.
            </li>
            <li>
              <strong>Sales:</strong> €1.200/mese.
            </li>
            <li>
              <strong>Stipendi cofounder:</strong> <strong>€2.000/mese ciascuno</strong> nel primo anno; <strong>€2.500/mese</strong> dal secondo <em>solo se</em> le revenue effettive sono entro <strong>±20%</strong> rispetto al business plan.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Key Metrics</h3>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Estetiste iscritte (crescita esponenziale, -20% sui primi 6 mesi rispetto al target).</li>
            <li>Prenotazioni cabina/mese (plateau a 24 mesi: 2/giorno top 30, 20% gli altri).</li>
            <li>MRR per stream: Estetiste PRO, Influencer PRO, Cabina-sharing, Saloni PRO.</li>
            <li>Conversioni PRO (20% estetiste, 20% creator; saloni 0→40%).</li>
            <li>CAC: ~€100/salone; ~€5/estetista (Italia).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Milestones 0–24 mesi</h3>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong>0–6 mesi:</strong> crescita community; avvio Estetiste PRO; prime partnership cabine.
            </li>
            <li>
              <strong>6–12 mesi:</strong> lancio Influencer/UGC PRO; accelerazione verso plateau cabina.
            </li>
            <li>
              <strong>12–24 mesi:</strong> adozione progressiva Saloni PRO (5%→15%→30–40%).
            </li>
          </ul>
        </section>
      </CardContent>
    </Card>
  );
}
