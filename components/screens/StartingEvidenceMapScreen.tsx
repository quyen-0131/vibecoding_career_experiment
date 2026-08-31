import { buildStartingEvidence } from "@/lib/evidence/buildStartingEvidence";
import type { CareerId } from "@/data/careers";
import type { ActivityEvidenceResponse, NormalizedActivity } from "@/types/prototype";

type Props = {
  careers: CareerId[];
  allActivities: NormalizedActivity[];
  responses: Record<string, ActivityEvidenceResponse>;
  onBack: () => void;
  onContinue: () => void;
};

export function StartingEvidenceMapScreen({ careers, allActivities, responses, onBack, onContinue }: Props) {
  return (
    <section className="screen extra-wide-screen">
      <div className="eyebrow">Your evidence map</div>
      <h1>What your past can and cannot tell you</h1>
      <p className="lead compact">
        This is not a career recommendation. It separates what you have done, what you want,
        how the local career model interprets that work, and what remains untested.
      </p>
      <dl className="evidence-state-key">
        <div><dt>Confirmed experience</dt><dd>You kept this activity after reviewing your CV.</dd></div>
        <div><dt>Your group preference</dt><dd>You chose More, About the same, or Less for each activity group.</dd></div>
        <div><dt>Career relevance</dt><dd>The prototype&apos;s local model describes how this activity appears in a career.</dd></div>
        <div><dt>Unknown</dt><dd>You do not yet have enough firsthand experience to judge it.</dd></div>
      </dl>

      <div className="role-narrative-grid">
        {careers.map((careerId, index) => {
          const narrative = buildStartingEvidence(careerId, allActivities, responses, careers.find((other) => other !== careerId));
          if (!narrative) return null;

          return (
            <article className={`role-narrative career-tone-${index + 1}`} key={careerId}>
              <header>
                <span>Career {index === 0 ? "A" : "B"}</span>
                <h2>{narrative.career.title}</h2>
              </header>

              <div className="role-evidence-counts" aria-label="Evidence overview">
                <div>
                  <strong>{narrative.matchedCount}</strong>
                  <span>reviewed activities matched</span>
                </div>
                <div>
                  <strong>{narrative.gaps.length}</strong>
                  <span>important areas untested</span>
                </div>
              </div>

              <section className="role-core-section">
                <h3>Core and important work in this career</h3>
                <p className="section-helper">
                  The percentage shows how much of this career group appears in the resume evidence you reviewed.
                  It measures past activity coverage, not ability or career fit.
                </p>
                <div className="evidence-coverage-groups">
                  {narrative.activityGroups.map((group) => (
                    <article className="evidence-coverage-group" key={group.name}>
                      <div className="coverage-heading">
                        <div className="coverage-title-row">
                          <strong>{group.name}</strong>
                          {group.preferenceLabel ? (
                            <span className="coverage-preference">Preference: {group.preferenceLabel}</span>
                          ) : (
                            <span className="coverage-preference unavailable">No preference evidence</span>
                          )}
                        </div>
                        <span>{group.coveragePercentage}% resume activity coverage</span>
                      </div>
                      <p>{group.representedCount} of {group.totalCount} important {group.totalCount === 1 ? "activity" : "activities"} found in reviewed resume evidence</p>
                      {!group.preferenceLabel ? (
                        <p className="coverage-preference-note">
                          {group.representedCount === 0
                            ? "No preference is shown because none of these career activities appeared in your reviewed resume evidence."
                            : "No preference response was recorded for the matched activity in this group."}
                        </p>
                      ) : null}
                      <div
                        className="coverage-track"
                        role="progressbar"
                        aria-label={`${group.name}: ${group.coveragePercentage}% of important activities found in reviewed resume evidence`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={group.coveragePercentage}
                      >
                        <span style={{ width: `${group.coveragePercentage}%` }} />
                      </div>
                      <details>
                        <summary>See activities in this group</summary>
                        <ul>
                          {group.activities.map((activity) => (
                            <li className={activity.hasEvidence ? "represented" : undefined} key={activity.id}>
                              <div className="coverage-activity-heading">
                                <span>{activity.label}</span>
                                <em>{activity.importance}</em>
                              </div>
                              <small>{activity.hasEvidence ? "Evidence found" : "Not yet seen"}</small>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </article>
                  ))}
                </div>
              </section>

              <section className="unknown-section">
                <h3>Important work still untested</h3>
                {narrative.gaps.length ? (
                  <ul>{narrative.gaps.map((gap) => <li key={gap.id}>{gap.label}</li>)}</ul>
                ) : (
                  <p>Your past work touches the main mapped areas. It still cannot show how sustained work in this career would feel.</p>
                )}
              </section>
            </article>
          );
        })}
      </div>

      <div className="experiment-callout">
        <div>
          <strong>What happens next</strong>
          <p>Choose one question. The prototype will help you turn it into a bounded career experiment.</p>
        </div>
        <button className="button light" type="button" onClick={onContinue}>
          Plan what to test next <span aria-hidden="true">-&gt;</span>
        </button>
      </div>
      <div className="actions single">
        <button className="button ghost" type="button" onClick={onBack}>Back to preference review</button>
      </div>
    </section>
  );
}
