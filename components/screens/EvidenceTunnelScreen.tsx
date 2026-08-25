import { ChoiceGroup } from "@/components/ChoiceGroup";
import { getCareerModel, type CareerId } from "@/data/careers";
import {
  applyPreferenceToActivityGroup,
  getEvidenceActivityGroups,
} from "@/lib/evidence/selectTopEvidenceActivities";
import type { ActivityEvidenceResponse, ActivityPreference, NormalizedActivity } from "@/types/prototype";

const preferenceOptions = ["more", "same", "less"] as const;
const preferenceLabels = { more: "More", same: "About the same", less: "Less" };
const relationshipLabels = { direct: "Direct match", transferable: "Transferable", adjacent: "Adjacent", unknown: "Not yet mapped" } as const;

type Props = {
  activities: NormalizedActivity[];
  careers: CareerId[];
  responses: Record<string, ActivityEvidenceResponse>;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onResponseChange: (responses: Record<string, ActivityEvidenceResponse>) => void;
  onComplete: () => void;
  onBack: () => void;
};

export function EvidenceTunnelScreen({
  activities,
  careers,
  responses,
  currentIndex,
  onIndexChange,
  onResponseChange,
  onComplete,
  onBack,
}: Props) {
  const groups = getEvidenceActivityGroups(activities);
  const group = groups[currentIndex];
  if (!group) return null;

  const groupPreferences = Array.from(new Set(
    group.activities
      .map((activity) => responses[activity.id]?.preference)
      .filter((preference): preference is ActivityPreference => Boolean(preference)),
  ));
  const groupPreference = groupPreferences.length === 1 ? groupPreferences[0] : undefined;
  const answeredGroupCount = groups.filter((item) =>
    item.activities.every((activity) => responses[activity.id]?.preference),
  ).length;
  const update = (preference: ActivityPreference) =>
    onResponseChange(applyPreferenceToActivityGroup(responses, group, preference));
  const next = () => currentIndex === groups.length - 1
    ? onComplete()
    : onIndexChange(currentIndex + 1);

  return (
    <section className="screen tunnel-screen grouped-tunnel-screen">
      <div className="tunnel-progress" aria-label={`${answeredGroupCount} of ${groups.length} activity groups answered`}>
        <span>Group {currentIndex + 1} of {groups.length} | {answeredGroupCount} answered</span>
        <div aria-hidden="true"><i style={{ width: `${((currentIndex + 1) / groups.length) * 100}%` }} /></div>
      </div>

      <div className="eyebrow">Review one type of work at a time</div>
      <h1>{group.label}</h1>
      <p className="lead compact">
        Your selected experiences contain {group.activities.length} {group.activities.length === 1 ? "activity" : "activities"} in this group.
        Review them together, then answer once for the group overall.
      </p>

      <section className="grouped-activity-evidence" aria-labelledby="group-activities-heading">
        <h2 id="group-activities-heading">What you have done</h2>
        <ul>
          {group.activities.map((activity) => {
            const organisations = Array.from(new Set(activity.sources.map((source) => source.organisation || source.title)));
            return (
              <li key={activity.id}>
                <div>
                  <strong>{activity.label}</strong>
                  <span>Seen in {activity.recurrenceCount} {activity.recurrenceCount === 1 ? "experience" : "experiences"}</span>
                </div>
                {organisations.length ? <small>{organisations.join(" | ")}</small> : null}
              </li>
            );
          })}
        </ul>
        {group.activities.some((activity) => (activity.originalEvidence?.length ?? 0) > 0 || activity.originalLabels.length > 0) && (
          <details className="group-original-evidence">
            <summary>See the original CV wording</summary>
            <ul>
              {group.activities.flatMap((activity) =>
                (activity.originalEvidence?.length ?? 0) > 0
                  ? activity.originalEvidence!.map((evidence) => (
                      <li key={`${activity.id}-${evidence.experienceId}-${evidence.label}`}>
                        <strong>{activity.label}</strong>
                        <span>{evidence.label}</span>
                      </li>
                    ))
                  : activity.originalLabels.map((label) => (
                      <li key={`${activity.id}-${label}`}>
                        <strong>{activity.label}</strong>
                        <span>{label}</span>
                      </li>
                    )),
              )}
            </ul>
          </details>
        )}
      </section>

      <p className="purpose-note">
        <strong>Why we&apos;re asking</strong>
        <span>Your CV suggests you have done this type of work. This single answer tells us whether you want the group overall to be a larger or smaller part of your future career.</span>
      </p>

      <div className="group-career-comparison">
        <p className="comparison-kicker">How this group appears in your career options</p>
        {careers.map((careerId, index) => {
          const career = getCareerModel(careerId);
          const mappedActivities = group.activities.map((activity) => ({
            activity,
            transfer: activity.careerTransfers[careerId],
          }));
          const mappedCount = mappedActivities.filter(({ transfer }) => transfer && transfer.relationship !== "unknown").length;

          return (
            <section className={`group-career career-tone-${index + 1}`} key={careerId}>
              <header>
                <div><span>Career {index === 0 ? "A" : "B"}</span><h2>{career?.title}</h2></div>
                <strong>{mappedCount} of {group.activities.length} activities mapped</strong>
              </header>
              <ul>
                {mappedActivities.map(({ activity, transfer }) => {
                  const unknown = !transfer || transfer.relationship === "unknown";
                  return (
                    <li key={activity.id}>
                      <div>
                        <strong>{activity.label}</strong>
                        <span>{unknown ? "Not yet mapped" : `${transfer.importance} | ${relationshipLabels[transfer.relationship]}`}</span>
                      </div>
                      <p>{transfer?.rationale ?? "The local career model does not yet contain a specific mapping for this activity."}</p>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="tunnel-questions group-preference-question">
        <ChoiceGroup
          label="Overall, would you want this type of work to continue being part of your future career?"
          options={preferenceOptions}
          labels={preferenceLabels}
          value={groupPreference}
          onChange={update}
        />
        <p>Choose the answer that best reflects this group overall.</p>
      </div>

      <div className="actions">
        <button
          className="button ghost"
          type="button"
          onClick={currentIndex === 0 ? onBack : () => onIndexChange(currentIndex - 1)}
        >
          {currentIndex === 0 ? "Back to activities" : "Previous group"}
        </button>
        <button className="button primary" type="button" disabled={!groupPreference} onClick={next}>
          {currentIndex === groups.length - 1 ? "See my evidence map" : "Next group"} <span aria-hidden="true">-&gt;</span>
        </button>
      </div>
    </section>
  );
}
