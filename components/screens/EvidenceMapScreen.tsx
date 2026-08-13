import { getCareerActivity, getCareerModel, type CareerId } from "@/data/careers";
import type { ActivityPreference, DetectedActivity } from "@/types/prototype";

type Props = {
  careers: CareerId[];
  activities: DetectedActivity[];
  preferences: Record<string, ActivityPreference>;
  onBack: () => void;
  onContinue: () => void;
};

const preferenceLabels: Record<ActivityPreference, string> = {
  more: "Wants more",
  same: "Same",
  less: "Wants less",
};

export function EvidenceMapScreen({ careers, activities, preferences, onBack, onContinue }: Props) {
  return (
    <section className="screen extra-wide-screen">
      <div className="eyebrow">Known evidence → relevance → preference → unknowns</div>
      <h1>Your current evidence map</h1>
      <p className="lead compact">This is not a career recommendation yet. It shows what your past experience already helps us understand — and what still needs to be tested.</p>
      <div className="career-map-grid">
        {careers.map((careerId) => {
          const career = getCareerModel(careerId);
          if (!career) return null;
          return (
            <article className="career-map" key={career.id}>
              <header><span>Career being explored</span><h2>{career.name}</h2></header>
              <section className="map-section known-evidence">
                <h3>You already have experience with</h3>
                <div className="map-activity-list">
                  {activities.map((activity) => {
                    const relevance = getCareerActivity(careerId, activity.activityId);
                    return (
                      <div className="map-activity" key={activity.id}>
                        <div><strong>{relevance.label === "Transferable activity" ? activity.label : relevance.label}</strong><span>{relevance.importance}</span></div>
                        {preferences[activity.id] && <em className={`preference preference-${preferences[activity.id]}`}>{preferenceLabels[preferences[activity.id]]}</em>}
                      </div>
                    );
                  })}
                </div>
              </section>
              <section className="map-section unknown-evidence">
                <h3>We still need evidence about</h3>
                <ul>{career.unknowns.map((unknown) => <li key={unknown}>{unknown}</li>)}</ul>
              </section>
            </article>
          );
        })}
      </div>
      <div className="experiment-callout"><p>You&apos;ve used your past experience. Now let&apos;s test what your CV can&apos;t tell us.</p><button className="button light" type="button" onClick={onContinue}>Create my first career experiment <span aria-hidden="true">→</span></button></div>
      <div className="actions single"><button className="button ghost" type="button" onClick={onBack}>Back to preferences</button></div>
    </section>
  );
}
