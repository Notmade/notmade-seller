"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { api, type BankDetails, type BankDetailsBody } from "../lib/seller-api";
import type { SellerCountryCode } from "../lib/currency";
import { validateBank, type BankErrors, type BankInput } from "../lib/validate";
import { Alert, Button, Card, Field, Skeleton } from "./portal-ui";

/** Shown while GET /seller/payouts says payout_blocked. Only the backend decides that. */
export function PayoutBlockedNotice({ country }: { country: SellerCountryCode }) {
  return (
    <Alert kind="warn">
      <strong>Add bank details to receive payouts.</strong>{" "}
      Your settlements keep building up, but none can be paid until your {country === "AE" ? "IBAN is" : "bank details are"} saved.{" "}
      <Link href="/dashboard/profile#bank" style={{ color: "#CC0000", fontWeight: 700 }}>Add bank details</Link>
    </Alert>
  );
}

const EMPTY: BankInput = { account_holder_name: "", bank_name: "", account_number: "", ifsc: "", iban: "" };

function requestBody(country: SellerCountryCode, f: BankInput): BankDetailsBody {
  const shared = { account_holder_name: f.account_holder_name.trim(), bank_name: f.bank_name.trim() || undefined };
  if (country === "AE") return { ...shared, account_holder_name: shared.account_holder_name || undefined, iban: f.iban.replace(/\s+/g, "").toUpperCase() };
  return { ...shared, account_number: f.account_number.replace(/[\s-]/g, ""), ifsc: f.ifsc.trim().toUpperCase() };
}

/** Where the seller is paid. Saved numbers come back masked, so a change re-enters them in full. */
export function BankDetailsCard({ country }: { country: SellerCountryCode }) {
  const uae = country === "AE";
  const [details, setDetails] = useState<BankDetails | null>(null);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState<BankInput>(EMPTY);
  const [errors, setErrors] = useState<BankErrors>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.bankDetails().then(setDetails).catch(err => setLoadError(err instanceof Error ? err.message : "Could not load bank details"));
  }, []);

  const startEdit = () => {
    setF({ ...EMPTY, account_holder_name: details?.bank.account_holder_name ?? "", bank_name: details?.bank.bank_name ?? "" });
    setErrors({}); setError(""); setSaved(false); setEditing(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const problems = validateBank(country, f);
    setErrors(problems); setError("");
    if (Object.keys(problems).length) return;
    setSaving(true);
    try {
      setDetails(await api.saveBankDetails(requestBody(country, f)));
      setEditing(false); setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save bank details");
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof BankInput) => (e: { target: { value: string } }) => setF(p => ({ ...p, [k]: e.target.value }));
  const complete = !!details?.complete;

  return (
    <Card>
      <div id="bank" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10, scrollMarginTop: 72 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800 }}>Bank details</h2>
        {details && !editing && <Button variant="secondary" onClick={startEdit}>{complete ? "Change" : "Add bank details"}</Button>}
      </div>

      {loadError ? <Alert>{loadError}</Alert> : !details ? <Skeleton height={60} /> : editing ? (
        <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {uae ? (
            <Field label="IBAN" htmlFor="bank-iban" error={errors.iban} hint="UAE IBAN for settlements, e.g. AE07 0331 2345 6789 0123 456">
              <input id="bank-iban" className="field-input" value={f.iban} maxLength={34} autoComplete="off" style={{ textTransform: "uppercase" }} onChange={set("iban")} />
            </Field>
          ) : (
            <>
              <Field label="Account number" htmlFor="bank-account" error={errors.account_number}>
                <input id="bank-account" className="field-input" value={f.account_number} inputMode="numeric" maxLength={22} autoComplete="off" onChange={set("account_number")} />
              </Field>
              <Field label="IFSC" htmlFor="bank-ifsc" error={errors.ifsc} hint="11 characters, e.g. HDFC0001234">
                <input id="bank-ifsc" className="field-input" value={f.ifsc} maxLength={11} autoComplete="off" style={{ textTransform: "uppercase" }} onChange={set("ifsc")} />
              </Field>
            </>
          )}
          <Field label={uae ? "Account holder name (optional)" : "Account holder name"} htmlFor="bank-holder" error={errors.account_holder_name}>
            <input id="bank-holder" className="field-input" value={f.account_holder_name} maxLength={200} autoComplete="off" onChange={set("account_holder_name")} />
          </Field>
          <Field label="Bank name (optional)" htmlFor="bank-name">
            <input id="bank-name" className="field-input" value={f.bank_name} maxLength={200} autoComplete="off" onChange={set("bank_name")} />
          </Field>
          {error && <Alert>{error}</Alert>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
            <Button variant="secondary" disabled={saving} onClick={() => setEditing(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save bank details"}</Button>
          </div>
        </form>
      ) : complete ? (
        <>
          {saved && <div style={{ marginBottom: 10 }}><Alert kind="success">Bank details saved.</Alert></div>}
          <dl style={{ margin: 0, fontSize: 14, display: "grid", gridTemplateColumns: "minmax(0, 150px) minmax(0, 1fr)", gap: "6px 12px" }}>
            {([
              ...(uae ? [["IBAN", details.bank.iban]] : [["Account number", details.bank.account_number], ["IFSC", details.bank.ifsc]]),
              ["Account holder", details.bank.account_holder_name], ["Bank", details.bank.bank_name],
            ] as [string, string | null | undefined][]).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ display: "contents" }}><dt style={{ color: "#888888" }}>{k}</dt><dd style={{ margin: 0, wordBreak: "break-word" }}>{v}</dd></div>
            ))}
          </dl>
          <p style={{ fontSize: 12, color: "#AAAAAA", marginTop: 10 }}>We email you whenever these change. Your signed agreement keeps the details it was signed with.</p>
        </>
      ) : (
        <p style={{ fontSize: 14, color: "#888888" }}>No bank details saved yet. {uae ? "Add your IBAN" : "Add your bank account"} so NOTMADE can pay your settlements.</p>
      )}
    </Card>
  );
}
