import { getAmpel, daysText } from "@/lib/mhd";

// MHD-Ampel als farbiges Label, optional mit Resttagen
export default function AmpelBadge({ expiry, showDays = true }: { expiry: string; showDays?: boolean }) {
  const a = getAmpel(expiry);
  return (
    <>
      <span className={`ampel ${a.color}`}>{a.label}</span>
      {showDays && <> <small>{daysText(a.days)}</small></>}
    </>
  );
}
