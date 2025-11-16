"use client";

import { useParams } from "next/navigation";
import { rimatoDashboardData } from "@/lib/dashboard-data";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Calculator, FileText, Download, Mail, Save, Euro, Building2, User, Phone, MapPin, Calendar } from "lucide-react";

interface OfferteItem {
  omschrijving: string;
  aantal: number;
  eenheid: string;
  prijsPerEenheid: number;
  totaal: number;
}

export default function OffertegeneratorPage() {
  const params = useParams();
  const clientId = (params?.client as string) || "rimato";
  const cfg = rimatoDashboardData.leads.offertegenerator;

  const [klantGegevens, setKlantGegevens] = useState({
    bedrijfsnaam: "",
    contactpersoon: "",
    email: "",
    telefoon: "",
    adres: "",
    plaats: "",
    postcode: "",
  });

  const [offerteDetails, setOfferteDetails] = useState({
    dienst: cfg.disciplines[0]?.id || "",
    oppervlakte: "",
    uren: "",
    materiaalKosten: "",
    opmerkingen: "",
    geldigheid: "30",
    betalingstermijn: "14",
  });

  const [offerteItems, setOfferteItems] = useState<OfferteItem[]>([]);
  const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const calculateOfferte = () => {
    const selectedDienst = cfg.disciplines.find(d => d.id === offerteDetails.dienst);
    if (!selectedDienst) return;

    const items: OfferteItem[] = [];
    let totaal = 0;

    // Basis dienst
    items.push({
      omschrijving: selectedDienst.name,
      aantal: 1,
      eenheid: "dienst",
      prijsPerEenheid: selectedDienst.basePrice || selectedDienst.baseRate || 0,
      totaal: selectedDienst.basePrice || selectedDienst.baseRate || 0,
    });
    totaal += items[0].totaal;

    // Uren
    if (offerteDetails.uren && parseFloat(offerteDetails.uren) > 0) {
      const uren = parseFloat(offerteDetails.uren);
      const uurPrijs = selectedDienst.baseRate || 85;
      const urenTotaal = uren * uurPrijs;
      items.push({
        omschrijving: "Uren arbeid",
        aantal: uren,
        eenheid: "uur",
        prijsPerEenheid: uurPrijs,
        totaal: urenTotaal,
      });
      totaal += urenTotaal;
    }

    // Oppervlakte (indien van toepassing)
    if (offerteDetails.oppervlakte && parseFloat(offerteDetails.oppervlakte) > 0) {
      const oppervlakte = parseFloat(offerteDetails.oppervlakte);
      const m2Prijs = 5; // €5 per m²
      const oppervlakteTotaal = oppervlakte * m2Prijs;
      items.push({
        omschrijving: "Oppervlakte behandeling",
        aantal: oppervlakte,
        eenheid: "m²",
        prijsPerEenheid: m2Prijs,
        totaal: oppervlakteTotaal,
      });
      totaal += oppervlakteTotaal;
    }

    // Materiaalkosten
    if (offerteDetails.materiaalKosten && parseFloat(offerteDetails.materiaalKosten) > 0) {
      const materiaal = parseFloat(offerteDetails.materiaalKosten);
      items.push({
        omschrijving: "Materiaalkosten",
        aantal: 1,
        eenheid: "stuk",
        prijsPerEenheid: materiaal,
        totaal: materiaal,
      });
      totaal += materiaal;
    }

    setOfferteItems(items);
    setCalculatedTotal(totaal);
    setShowPreview(true);
  };

  const btw = calculatedTotal ? calculatedTotal * 0.21 : 0;
  const totaalInclBTW = calculatedTotal ? calculatedTotal + btw : 0;

  return (
    <div className="page-admin">
      <div className="page-header">
        <Link href={`/clients/${clientId}/leads`} className="btn btn--secondary">
          <ArrowLeft size={16} />
          Terug naar Leads
        </Link>
        <div style={{ flex: 1 }}>
          <h1>Offertegenerator</h1>
          <p className="client-tagline">Gestandaardiseerde sjablonen en automatische kostenberekening voor offertes.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Klantgegevens */}
        <section className="dashboard-card">
          <div className="dashboard-card__header">
            <h2>Klantgegevens</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                Bedrijfsnaam *
              </label>
              <input
                type="text"
                className="page-search"
                value={klantGegevens.bedrijfsnaam}
                onChange={(e) => setKlantGegevens({ ...klantGegevens, bedrijfsnaam: e.target.value })}
                placeholder="Bijv. Machinefabriek De Vries"
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                Contactpersoon *
              </label>
              <input
                type="text"
                className="page-search"
                value={klantGegevens.contactpersoon}
                onChange={(e) => setKlantGegevens({ ...klantGegevens, contactpersoon: e.target.value })}
                placeholder="Bijv. Jan de Vries"
                required
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                  E-mail *
                </label>
                <input
                  type="email"
                  className="page-search"
                  value={klantGegevens.email}
                  onChange={(e) => setKlantGegevens({ ...klantGegevens, email: e.target.value })}
                  placeholder="info@bedrijf.nl"
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                  Telefoon
                </label>
                <input
                  type="tel"
                  className="page-search"
                  value={klantGegevens.telefoon}
                  onChange={(e) => setKlantGegevens({ ...klantGegevens, telefoon: e.target.value })}
                  placeholder="0528-123456"
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                Adres
              </label>
              <input
                type="text"
                className="page-search"
                value={klantGegevens.adres}
                onChange={(e) => setKlantGegevens({ ...klantGegevens, adres: e.target.value })}
                placeholder="Straat + huisnummer"
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                  Plaats
                </label>
                <input
                  type="text"
                  className="page-search"
                  value={klantGegevens.plaats}
                  onChange={(e) => setKlantGegevens({ ...klantGegevens, plaats: e.target.value })}
                  placeholder="Hoogeveen"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                  Postcode
                </label>
                <input
                  type="text"
                  className="page-search"
                  value={klantGegevens.postcode}
                  onChange={(e) => setKlantGegevens({ ...klantGegevens, postcode: e.target.value })}
                  placeholder="7901 AA"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Offerte Configuratie */}
        <section className="dashboard-card">
          <div className="dashboard-card__header">
            <h2>Offerte Configuratie</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                Diensten & Basistarieven
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                {cfg.disciplines.map((d) => (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid var(--client-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input
                        type="radio"
                        name="dienst"
                        value={d.id}
                        checked={offerteDetails.dienst === d.id}
                        onChange={(e) => setOfferteDetails({ ...offerteDetails, dienst: e.target.value })}
                        style={{ margin: 0 }}
                      />
                      <span style={{ fontSize: "0.95rem" }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>€{(d.basePrice || d.baseRate || 0).toLocaleString("nl-NL")}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                Oppervlakte (m²)
              </label>
              <input
                type="number"
                min={0}
                step={1}
                className="page-search"
                value={offerteDetails.oppervlakte}
                onChange={(e) => setOfferteDetails({ ...offerteDetails, oppervlakte: e.target.value })}
                placeholder="Bijv. 250"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                Benodigde uren
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                className="page-search"
                value={offerteDetails.uren}
                onChange={(e) => setOfferteDetails({ ...offerteDetails, uren: e.target.value })}
                placeholder="Bijv. 16"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                Materiaalkosten (€)
              </label>
              <input
                type="number"
                min={0}
                step={1}
                className="page-search"
                value={offerteDetails.materiaalKosten}
                onChange={(e) => setOfferteDetails({ ...offerteDetails, materiaalKosten: e.target.value })}
                placeholder="Bijv. 180"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                Opmerkingen
              </label>
              <textarea
                className="page-search"
                rows={3}
                value={offerteDetails.opmerkingen}
                onChange={(e) => setOfferteDetails({ ...offerteDetails, opmerkingen: e.target.value })}
                placeholder="Optionele opmerkingen voor de offerte..."
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                  Geldigheid (dagen)
                </label>
                <input
                  type="number"
                  min={1}
                  className="page-search"
                  value={offerteDetails.geldigheid}
                  onChange={(e) => setOfferteDetails({ ...offerteDetails, geldigheid: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                  Betalingstermijn (dagen)
                </label>
                <input
                  type="number"
                  min={1}
                  className="page-search"
                  value={offerteDetails.betalingstermijn}
                  onChange={(e) => setOfferteDetails({ ...offerteDetails, betalingstermijn: e.target.value })}
                />
              </div>
            </div>
            <button
              type="button"
              className="btn btn--primary"
              onClick={calculateOfferte}
              disabled={!klantGegevens.bedrijfsnaam || !klantGegevens.contactpersoon || !klantGegevens.email || !offerteDetails.dienst}
            >
              <Calculator size={16} />
              Bereken Offerte
            </button>
          </div>
        </section>
      </div>

      {/* Offerte Preview */}
      {showPreview && calculatedTotal !== null && (
        <section className="dashboard-card dashboard-card--primary" style={{ marginTop: "1.5rem" }}>
          <div className="dashboard-card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Offerte Preview</h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button" className="btn btn--secondary" style={{ background: "rgba(255,255,255,0.2)" }}>
                <Download size={16} />
                PDF
              </button>
              <button type="button" className="btn btn--secondary" style={{ background: "rgba(255,255,255,0.2)" }}>
                <Mail size={16} />
                Verstuur
              </button>
              <button type="button" className="btn btn--secondary" style={{ background: "rgba(255,255,255,0.2)" }}>
                <Save size={16} />
                Opslaan
              </button>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: "0.75rem", padding: "2rem", color: "#0f172a" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "2px solid #e2e8f0" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#ED1D24" }}>Rimato</h3>
                <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>
                  Dr. Anton Philipsstraat 31<br />
                  7903 AL Hoogeveen<br />
                  Tel: 0528 - 270 269<br />
                  E-mail: info@rimato.nl
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <h4 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>OFFERTE</h4>
                <p style={{ margin: "0.5rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>
                  Datum: {new Date().toLocaleDateString("nl-NL")}<br />
                  Offertenummer: OFF-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 1000)).padStart(3, "0")}
                </p>
              </div>
            </div>

            {/* Klantgegevens */}
            <div style={{ marginBottom: "2rem" }}>
              <h4 style={{ margin: "0 0 0.75rem", fontSize: "1rem", fontWeight: 600 }}>Geadresseerde:</h4>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                <strong>{klantGegevens.bedrijfsnaam}</strong>
                {klantGegevens.contactpersoon && (
                  <>
                    <br />
                    {klantGegevens.contactpersoon}
                  </>
                )}
                {klantGegevens.adres && (
                  <>
                    <br />
                    {klantGegevens.adres}
                  </>
                )}
                {klantGegevens.postcode && klantGegevens.plaats && (
                  <>
                    <br />
                    {klantGegevens.postcode} {klantGegevens.plaats}
                  </>
                )}
                {klantGegevens.email && (
                  <>
                    <br />
                    E-mail: {klantGegevens.email}
                  </>
                )}
                {klantGegevens.telefoon && (
                  <>
                    <br />
                    Tel: {klantGegevens.telefoon}
                  </>
                )}
              </p>
            </div>

            {/* Offerte Items */}
            <div style={{ marginBottom: "2rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600 }}>Omschrijving</th>
                    <th style={{ padding: "0.75rem", textAlign: "center", fontWeight: 600 }}>Aantal</th>
                    <th style={{ padding: "0.75rem", textAlign: "center", fontWeight: 600 }}>Eenheid</th>
                    <th style={{ padding: "0.75rem", textAlign: "right", fontWeight: 600 }}>Prijs</th>
                    <th style={{ padding: "0.75rem", textAlign: "right", fontWeight: 600 }}>Totaal</th>
                  </tr>
                </thead>
                <tbody>
                  {offerteItems.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "0.75rem" }}>{item.omschrijving}</td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>{item.aantal}</td>
                      <td style={{ padding: "0.75rem", textAlign: "center" }}>{item.eenheid}</td>
                      <td style={{ padding: "0.75rem", textAlign: "right" }}>€{item.prijsPerEenheid.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 600 }}>€{item.totaal.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totaal */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "2rem" }}>
              <div style={{ width: "300px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #e2e8f0" }}>
                  <span>Subtotaal (excl. BTW):</span>
                  <span style={{ fontWeight: 600 }}>€{calculatedTotal.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #e2e8f0" }}>
                  <span>BTW (21%):</span>
                  <span style={{ fontWeight: 600 }}>€{btw.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", marginTop: "0.5rem", borderTop: "2px solid #ED1D24" }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>Totaal (incl. BTW):</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ED1D24" }}>€{totaalInclBTW.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Opmerkingen & Voorwaarden */}
            {offerteDetails.opmerkingen && (
              <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#f8fafc", borderRadius: "0.5rem" }}>
                <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>Opmerkingen:</h4>
                <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{offerteDetails.opmerkingen}</p>
              </div>
            )}

            <div style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6 }}>
              <p style={{ margin: "0.5rem 0" }}>
                <strong>Geldigheid:</strong> Deze offerte is geldig tot {new Date(Date.now() + parseInt(offerteDetails.geldigheid) * 24 * 60 * 60 * 1000).toLocaleDateString("nl-NL")}.
              </p>
              <p style={{ margin: "0.5rem 0" }}>
                <strong>Betalingstermijn:</strong> {offerteDetails.betalingstermijn} dagen na factuurdatum.
              </p>
              <p style={{ margin: "0.5rem 0" }}>
                <strong>Algemene voorwaarden:</strong> Deze offerte is onderworpen aan de algemene voorwaarden van Rimato. Bij akkoord wordt een overeenkomst opgesteld.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}


