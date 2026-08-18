import { buildStartingEvidence } from "@/lib/evidence/buildStartingEvidence";
import type { CareerId, CareerImportance } from "@/data/careers";
import type { ActivityEvidenceResponse, NormalizedActivity } from "@/types/prototype";

type Props = { careers: CareerId[]; allActivities: NormalizedActivity[]; responses: Record<string, ActivityEvidenceResponse>; onBack: () => void; onContinue: () => void };

const importanceGroups: Array<{ importance: CareerImportance; label: string }> = [
  { importance: "Core", label: "Core to this role" },
  { importance: "Important", label: "Important in this role" },
  { importance: "Supporting", label: "Supporting in this role" },
  { importance: "Limited", label: "Less central in this role" },
];

export function StartingEvidenceMapScreen({ careers, allActivities, responses, onBack, onContinue }: Props) {
  return (
    <section className="screen extra-wide-screen">
      <div className="eyebrow">Past evidence, not a recommendation</div><h1>Your starting evidence</h1>
      <p className="lead compact">Activities are grouped by how central they are to each role. The short descriptions reflect whether you want the same or more of the work and how confident you currently feel.</p>
      <div className="role-narrative-grid">{careers.map((careerId, index) => {
        const narrative = buildStartingEvidence(careerId, allActivities, responses);
        if (!narrative) return null;
        return (
          <article className={`role-narrative career-tone-${index + 1}`} key={careerId}>
            <header><span>Role {index === 0 ? "A" : "B"}</span><h2>{narrative.career.title}</h2></header>
            <section>
              <h3>Evidence from work you have done</h3>
              <div className="evidence-importance-groups">{importanceGroups.map((group) => {
                const activities = narrative.transfers.filter(({ relevance }) => relevance.importance === group.importance);
                if (!activities.length) return null;
                return <section className="evidence-importance-group" key={group.importance}>
                  <h4>{group.label}</h4>
                  <ul className="transfer-list">{activities.map(({ activity, evidenceMeaning }) => <li key={activity.id}>
                    <strong>{activity.label}</strong>
                    <small className="evidence-meaning">{evidenceMeaning}</small>
                  </li>)}</ul>
                </section>;
              })}</div>
            </section>
            <section className="unknown-section"><h3>What your past cannot tell us yet</h3>{narrative.gaps.length ? <ul>{narrative.gaps.map((gap) => <li key={gap.id}>{gap.label}</li>)}</ul> : <p>Your CV touches the major mapped areas, but it still cannot show how the work feels in practice.</p>}</section>
            <p className="role-interpretation">{narrative.interpretation}</p>
          </article>
        );
      })}</div>
      <div className="experiment-callout"><p>Your past experience can only tell us so much. You choose the question; the app will design a small experiment around it.</p><button className="button light" type="button" onClick={onContinue}>Choose what I want to test <span aria-hidden="true">→</span></button></div>
      <div className="actions single"><button className="button ghost" type="button" onClick={onBack}>Back to activity review</button></div>
    </section>
  );
}
