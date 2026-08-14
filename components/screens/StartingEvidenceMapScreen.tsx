import { buildStartingEvidence } from "@/lib/evidence/buildStartingEvidence";
import type { CareerId } from "@/data/careers";
import type { ActivityEvidenceResponse, NormalizedActivity } from "@/types/prototype";

type Props = { careers: CareerId[]; allActivities: NormalizedActivity[]; responses: Record<string, ActivityEvidenceResponse>; priorityIds: string[]; onBack: () => void; onContinue: () => void };
const preferenceLabels = { more: "More", same: "About the same", less: "Less" } as const;
const confidenceLabels = { low: "Low", medium: "Medium", high: "High" } as const;

export function StartingEvidenceMapScreen({ careers, allActivities, responses, priorityIds, onBack, onContinue }: Props) {
  return (
    <section className="screen extra-wide-screen">
      <div className="eyebrow">Past evidence, not a recommendation</div><h1>Your starting evidence</h1>
      <p className="lead compact">Your past experience gives us a starting point. This is not a career recommendation — it shows what we know about each path and what still needs testing.</p>
      <div className="role-narrative-grid">{careers.map((careerId, index) => {
        const narrative = buildStartingEvidence(careerId, allActivities, responses, priorityIds);
        if (!narrative) return null;
        return (
          <article className={`role-narrative career-tone-${index + 1}`} key={careerId}>
            <header><span>Role {index === 0 ? "A" : "B"}</span><h2>{narrative.career.title}</h2></header>
            <section><h3>What already transfers</h3>{narrative.transfers.length ? <ul className="transfer-list">{narrative.transfers.map(({ activity, relevance, response, priority }) => <li key={activity.id}><div><strong>{activity.label}</strong>{priority && <em>Priority</em>}</div><p><span>{relevance.importance}</span>{response?.preference && <span>{preferenceLabels[response.preference]}</span>}{response?.confidence && <span>{confidenceLabels[response.confidence]} confidence</span>}</p></li>)}</ul> : <p className="no-gaps">No clear transfer evidence was found in the experiences you selected.</p>}</section>
            <section className="unknown-section"><h3>What your past cannot tell us yet</h3>{narrative.gaps.length ? <ul>{narrative.gaps.map((gap) => <li key={gap.id}>{gap.label}</li>)}</ul> : <p>Your CV touches the major mapped areas, but it still cannot show how the work feels in practice.</p>}</section>
            <p className="role-interpretation">{narrative.interpretation}</p>
          </article>
        );
      })}</div>
      <div className="experiment-callout"><p>Your past experience can only tell us so much. You choose the question; later, the app will design an experiment around it.</p><button className="button light" type="button" onClick={onContinue}>Choose what I want to test <span aria-hidden="true">→</span></button></div>
      <div className="actions single"><button className="button ghost" type="button" onClick={onBack}>Back to priorities</button></div>
    </section>
  );
}
