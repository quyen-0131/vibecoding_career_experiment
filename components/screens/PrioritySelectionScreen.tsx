import type { ActivityEvidenceResponse, NormalizedActivity } from "@/types/prototype";
import { canContinuePrioritySelection, getActivitiesByPreference, needsForcedPriorityChoice } from "@/lib/evidence/priorities";

type Props = { activities: NormalizedActivity[]; responses: Record<string, ActivityEvidenceResponse>; priorities: string[]; minimized: string[]; onPrioritiesChange: (ids: string[]) => void; onMinimizedChange: (ids: string[]) => void; onContinue: () => void; onBack: () => void };

const confidenceLabels = { low: "Low", medium: "Medium", high: "High" } as const;

function ToggleList({ activities, responses, selected, limit, onChange, badge }: { activities: NormalizedActivity[]; responses: Record<string, ActivityEvidenceResponse>; selected: string[]; limit: number; onChange: (ids: string[]) => void; badge: string }) {
  return <div className="priority-list">{activities.map((activity) => {
    const active = selected.includes(activity.id);
    const confidence = responses[activity.id]?.confidence;
    return <button className={active ? "priority-card selected" : "priority-card"} type="button" key={activity.id} aria-pressed={active} disabled={!active && selected.length === limit} onClick={() => onChange(active ? selected.filter((id) => id !== activity.id) : [...selected, activity.id])}><span className="check" aria-hidden="true">{active ? "✓" : ""}</span><span><strong>{activity.label}</strong><small>{badge}{confidence ? ` · ${confidenceLabels[confidence]} confidence` : ""}</small></span></button>;
  })}</div>;
}

export function PrioritySelectionScreen({ activities, responses, priorities, minimized, onPrioritiesChange, onMinimizedChange, onContinue, onBack }: Props) {
  const moreActivities = getActivitiesByPreference(activities, responses, "more");
  const lessActivities = getActivitiesByPreference(activities, responses, "less");
  const needsForcedChoice = needsForcedPriorityChoice(activities, responses);
  const moreIds = new Set(moreActivities.map((activity) => activity.id));
  const lessIds = new Set(lessActivities.map((activity) => activity.id));
  const validPriorities = priorities.filter((id) => moreIds.has(id));
  const validMinimized = minimized.filter((id) => lessIds.has(id));
  const effectivePriorities = needsForcedChoice ? validPriorities : moreActivities.map((activity) => activity.id);
  const canContinue = canContinuePrioritySelection(activities, responses, priorities);

  return (
    <section className="screen wide-screen">
      <div className="eyebrow">Turn preferences into priorities</div>
      <h1>{needsForcedChoice ? "If you could only choose three..." : "Your strongest preferences"}</h1>
      <p className="lead compact">{needsForcedChoice ? "Which three types of work would matter most in your future career?" : "You chose three or fewer activities for more. We'll carry these into your starting evidence map."}</p>
      {moreActivities.length ? <><div className="priority-section-heading"><h2>Activities you most want more of</h2><span>{effectivePriorities.length}{needsForcedChoice ? " of 3" : ""} selected</span></div><ToggleList activities={moreActivities} responses={responses} selected={effectivePriorities} limit={3} onChange={needsForcedChoice ? onPrioritiesChange : () => {}} badge="Wants more" /></> : <div className="empty-priority"><strong>No activities marked “More”</strong><p>That is still useful evidence. No priority activity is required.</p></div>}
      {lessActivities.length >= 2 && <section className="minimize-section"><div className="priority-section-heading"><div><h2>Which activities would you most want to minimise?</h2><p>Optional — choose up to three.</p></div><span>{validMinimized.length} of 3 selected</span></div><ToggleList activities={lessActivities} responses={responses} selected={validMinimized} limit={3} onChange={onMinimizedChange} badge="Wants less" /></section>}
      <div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back to evidence review</button><button className="button primary" type="button" disabled={!canContinue} onClick={() => { if (!needsForcedChoice) onPrioritiesChange(effectivePriorities); onContinue(); }}>Build my starting evidence <span aria-hidden="true">→</span></button></div>
    </section>
  );
}
