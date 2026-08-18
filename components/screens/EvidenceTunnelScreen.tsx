import { ChoiceGroup } from "@/components/ChoiceGroup";
import { EvidenceProvenance } from "@/components/EvidenceProvenance";
import { getCareerModel, type CareerId } from "@/data/careers";
import type { ActivityEvidenceResponse, ActivityPreference, NormalizedActivity, SkillConfidence } from "@/types/prototype";

const preferenceOptions = ["more", "same", "less"] as const;
const confidenceOptions = ["high", "medium", "low"] as const;
const preferenceLabels = { more: "More", same: "About the same", less: "Less" };
const confidenceLabels = { low: "Low", medium: "Medium", high: "High" };
const relationshipLabels = { direct: "Direct match", transferable: "Transferable", adjacent: "Adjacent", unknown: "Not yet mapped" } as const;

type Props = { activities: NormalizedActivity[]; careers: CareerId[]; responses: Record<string, ActivityEvidenceResponse>; currentIndex: number; onIndexChange: (index: number) => void; onResponseChange: (responses: Record<string, ActivityEvidenceResponse>) => void; onComplete: () => void; onBack: () => void };

export function EvidenceTunnelScreen({ activities, careers, responses, currentIndex, onIndexChange, onResponseChange, onComplete, onBack }: Props) {
  const activity = activities[currentIndex];
  if (!activity) return null;
  const response = responses[activity.id] ?? {};
  const update = (patch: ActivityEvidenceResponse) => onResponseChange({ ...responses, [activity.id]: { ...response, ...patch } });
  const answered = Boolean(response.preference && response.confidence);
  const next = () => currentIndex === activities.length - 1 ? onComplete() : onIndexChange(currentIndex + 1);

  return (
    <section className="screen tunnel-screen">
      <div className="tunnel-progress"><span>{currentIndex + 1} of {activities.length}</span><div><i style={{ width: `${((currentIndex + 1) / activities.length) * 100}%` }} /></div></div>
      <div className="eyebrow">One transferable activity at a time</div>
      <h1>{activity.label}</h1>
      <EvidenceProvenance activity={activity} compact />
      {activity.originalLabels.length > 0 && <details className="tunnel-original-evidence"><summary>See the original evidence</summary><ul>{activity.originalLabels.map((label) => <li key={label}>{label}</li>)}</ul></details>}
      <div className="tunnel-comparison"><p className="comparison-kicker">How this work transfers to your role options</p>{careers.map((careerId, index) => {
        const career = getCareerModel(careerId);
        const transfer = activity.careerTransfers[careerId];
        const unknown = !transfer || transfer.relationship === "unknown";
        return <section className={`tunnel-career career-tone-${index + 1}`} key={careerId}><div><span>Role {index === 0 ? "A" : "B"}</span><strong>{career?.title}</strong></div><div className="transfer-badges"><em className={`importance importance-${unknown ? "unknown" : transfer.importance.toLowerCase()}`}>{unknown ? "Unknown" : transfer.importance}</em>{transfer && <small>{relationshipLabels[transfer.relationship]}</small>}</div><p>{transfer?.rationale ?? "There is not enough information to map this responsibly yet. This is unknown—not evidence that the activity is unimportant."}</p></section>;
      })}</div>
      <div className="tunnel-questions"><ChoiceGroup label="Would you want more or less of this type of work in your future career?" options={preferenceOptions} labels={preferenceLabels} value={response.preference} onChange={(preference: ActivityPreference) => update({ preference })} /><ChoiceGroup label="How confident are you in your current ability to do this well?" options={confidenceOptions} labels={confidenceLabels} value={response.confidence} onChange={(confidence: SkillConfidence) => update({ confidence })} /><p className="self-assessment-note">This is your current self-assessment, not an objective ability score. Later experiments can provide another source of evidence.</p></div>
      <div className="actions"><button className="button ghost" type="button" onClick={currentIndex === 0 ? onBack : () => onIndexChange(currentIndex - 1)}>{currentIndex === 0 ? "Back to overview" : "Previous"}</button><button className="button primary" type="button" disabled={!answered} onClick={next}>{currentIndex === activities.length - 1 ? "See my starting evidence" : "Next activity"} <span aria-hidden="true">→</span></button></div>
    </section>
  );
}
