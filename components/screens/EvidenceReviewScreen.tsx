import { ChoiceGroup } from "@/components/ChoiceGroup";
import { getCareerActivity, getCareerModel, type CareerId } from "@/data/careers";
import type { ActivityPreference, CareerRelevanceByActivity, DetectedActivity } from "@/types/prototype";

type Props = {
  activities: DetectedActivity[];
  careers: CareerId[];
  preferences: Record<string, ActivityPreference>;
  careerRelevance: CareerRelevanceByActivity;
  onChange: (preferences: Record<string, ActivityPreference>) => void;
  onContinue: () => void;
  onBack: () => void;
};

const preferenceOptions = ["more", "same", "less"] as const;
const preferenceLabels = { more: "More", same: "About the same", less: "Less" };

export function EvidenceReviewScreen({ activities, careers, preferences, careerRelevance, onChange, onContinue, onBack }: Props) {
  const complete = activities.every((activity) => preferences[activity.id]);
  const update = (activityId: string, preference: ActivityPreference) => onChange({ ...preferences, [activityId]: preference });

  return (
    <section className="screen extra-wide-screen">
      <div className="eyebrow">Experience is not preference</div>
      <h1>What would you like more or less of?</h1>
      <p className="lead compact">See how each activity relates to both careers, then choose the amount you would want in your future work.</p>
      <div className="evidence-list">
        {activities.map((activity, index) => (
          <article className="preference-card" key={activity.id}>
            <div className="preference-heading"><span className="activity-number">Activity {String(index + 1).padStart(2, "0")}</span><h2>{activity.label}</h2></div>
            <div className="career-relevance-grid">
              {careers.map((careerId) => {
                const career = getCareerModel(careerId);
                const mappedActivity = getCareerActivity(careerId, activity.activityId);
                const relevance = careerRelevance[activity.id]?.[careerId] ?? mappedActivity;
                return (
                  <section className="career-relevance" key={careerId}>
                    <div className="career-label">{career?.name}</div>
                    <div className={`importance importance-${relevance.importance.toLowerCase()}`}>{relevance.importance} activity</div>
                    <p>{relevance.description}</p>
                  </section>
                );
              })}
            </div>
            <ChoiceGroup label="Would you like more or less of this type of work in your future career?" options={preferenceOptions} labels={preferenceLabels} value={preferences[activity.id]} onChange={(preference) => update(activity.id, preference)} />
          </article>
        ))}
      </div>
      <div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back</button><button className="button primary" type="button" disabled={!complete} onClick={onContinue}>See my evidence map <span aria-hidden="true">→</span></button></div>
    </section>
  );
}
