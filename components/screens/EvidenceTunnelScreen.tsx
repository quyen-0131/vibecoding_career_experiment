import { ChoiceGroup } from "@/components/ChoiceGroup";
import { EvidenceProvenance } from "@/components/EvidenceProvenance";
import { getCareerActivity, getCareerModel, type CareerId } from "@/data/careers";
import type { ActivityEvidenceResponse, ActivityPreference, NormalizedActivity, SkillConfidence } from "@/types/prototype";

const preferenceOptions = ["more", "same", "less"] as const;
const confidenceOptions = ["high", "medium", "low"] as const;
const preferenceLabels = { more: "More", same: "About the same", less: "Less" };
const confidenceLabels = { low: "Low", medium: "Medium", high: "High" };

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
      <div className="eyebrow">One activity at a time</div>
      <h1>{activity.label}</h1>
      <EvidenceProvenance activity={activity} compact />
      <div className="tunnel-comparison"><p className="comparison-kicker">Where this appears in your role options</p>{careers.map((careerId, index) => {
        const career = getCareerModel(careerId);
        const relevance = getCareerActivity(careerId, activity.canonicalId);
        return <section className={`tunnel-career career-tone-${index + 1}`} key={careerId}><div><span>Role {index === 0 ? "A" : "B"}</span><strong>{career?.title}</strong></div><em className={`importance importance-${relevance.importance.toLowerCase()}`}>{relevance.importance}</em><p>{relevance.description}</p></section>;
      })}</div>
      <div className="tunnel-questions"><ChoiceGroup label="Would you want more or less of this type of work in your future career?" options={preferenceOptions} labels={preferenceLabels} value={response.preference} onChange={(preference: ActivityPreference) => update({ preference })} /><ChoiceGroup label="How confident are you in your current ability to do this well?" options={confidenceOptions} labels={confidenceLabels} value={response.confidence} onChange={(confidence: SkillConfidence) => update({ confidence })} /><p className="self-assessment-note">This is your current self-assessment, not an objective ability score. Later experiments can provide another source of evidence.</p></div>
      <div className="actions"><button className="button ghost" type="button" onClick={currentIndex === 0 ? onBack : () => onIndexChange(currentIndex - 1)}>{currentIndex === 0 ? "Back to overview" : "Previous"}</button><button className="button primary" type="button" disabled={!answered} onClick={next}>{currentIndex === activities.length - 1 ? "Choose priorities" : "Next activity"} <span aria-hidden="true">→</span></button></div>
    </section>
  );
}
