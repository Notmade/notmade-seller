"use client";

import { useCallback, useEffect, useState } from "react";
import { api, fmtDate, type UaeAgreementResponse } from "../../lib/seller-api";
import { useDashboardSeller } from "../seller-context";
import { Alert, Button, Card, FullPageSpinner, PageHeader, RED } from "../../components/portal-ui";
import { AgreementSigner, Pill } from "../../components/AgreementSigner";

export default function UaeSalesPage() {
  const seller = useDashboardSeller();
  const [state, setState] = useState<UaeAgreementResponse | null>(null);
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try { setState(await api.uaeAgreement()); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not load UAE status"); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const loadAgreement = useCallback(async () => {
    const r = await api.uaeAgreement();
    if (!r.agreement) throw new Error("International addendum is not available");
    return r.agreement;
  }, []);

  if (error) {
    return (
      <div>
        <PageHeader title="UAE sales" />
        <Alert>{error} <button type="button" onClick={() => void load()} style={{ color: RED, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Retry</button></Alert>
      </div>
    );
  }
  if (!state) return <FullPageSpinner />;

  const pct = state.commission_pct;
  const uaeBased = state.seller_country === "AE";

  return (
    <div>
      <PageHeader title="UAE sales" sub="Sell on uae.notmade.in with a separate AED price for each product." />

      {state.ready ? (
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111111" }}>You can sell in the UAE</h2>
          <p style={{ fontSize: 14, color: "#666666", marginTop: 6, lineHeight: 1.6 }}>
            {uaeBased ? "UAE seller agreement" : "International sales addendum"} <strong>{state.signed_agreement_version}</strong> signed on {fmtDate(state.signed_at)}.
            {pct !== null && <> NOTMADE&apos;s UAE commission on your products is <strong>{pct}%</strong> of the AED selling price.</>}
          </p>
          <p style={{ fontSize: 13, color: "#888888", marginTop: 10 }}>
            Switch on &quot;Also sell in the UAE&quot; and set an AED price on each product. To stop selling in the UAE, email admin@notmade.in (14 days&apos; notice).
          </p>
        </Card>
      ) : uaeBased ? (
        <Alert kind="warn">Your UAE seller agreement is not on file. Contact admin@notmade.in.</Alert>
      ) : signing ? (
        <AgreementSigner
          seller={seller}
          title="NOTMADE International Sales Addendum"
          load={loadAgreement}
          sign={api.signUaeAgreement}
          // Reload so the dashboard (and the product form's UAE toggle) see the new status
          onSigned={async () => { window.location.assign("/dashboard/products"); }}
          pills={a => (
            <>
              <Pill>UAE commission {a.commission_rate}%</Pill>
              <Pill>AED pricing</Pill>
              <Pill>3-day unboxing-video returns</Pill>
            </>
          )}
        />
      ) : (
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111111" }}>Sign the international sales addendum</h2>
          <p style={{ fontSize: 14, color: "#666666", marginTop: 6, lineHeight: 1.6 }}>
            {seller.uae_agreement_version || seller.sell_in_uae
              ? "UAE terms have been updated. Your UAE listings stay off until you sign the new addendum."
              : "To list products on the UAE store, review and sign the international sales addendum. You set a separate AED price for each product."}
            {pct !== null && <> NOTMADE&apos;s UAE commission is <strong>{pct}%</strong> of the AED selling price.</>}
          </p>
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => setSigning(true)} disabled={pct === null}>Review addendum →</Button>
          </div>
          {pct === null && <p style={{ fontSize: 13, color: "#888888", marginTop: 8 }}>UAE commission isn&apos;t configured yet. Please check back soon.</p>}
        </Card>
      )}
    </div>
  );
}
