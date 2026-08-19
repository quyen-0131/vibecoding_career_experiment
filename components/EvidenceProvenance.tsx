import type { NormalizedActivity } from "@/types/prototype";

export function EvidenceProvenance({ activity, compact = false }: { activity: NormalizedActivity; compact?: boolean }) {
  if (!activity.sources.length) return <p className="provenance-empty">Added by you</p>;
  const count = activity.recurrenceCount || activity.sources.length;
  const organisations = [...new Set(activity.sources.map((source) => source.organisation).filter(Boolean))] as string[];

  return (
    <div className={compact ? "provenance compact-provenance" : "provenance"}>
      <strong>{count === 1 ? "Seen in 1 experience" : `Seen across ${count} experiences`}</strong>
      {organisations.length > 0 && <div className="provenance-chips">{organisations.map((organisation) => <span key={organisation}>{organisation}</span>)}</div>}
    </div>
  );
}
