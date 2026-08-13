"use client";

import { useState } from "react";
import type { DetectedActivity, DetectedExperience } from "@/types/prototype";

type Props = {
  experiences: DetectedExperience[];
  onChange: (experiences: DetectedExperience[]) => void;
  onContinue: () => void;
  onBack: () => void;
};

function toActivityId(label: string) {
  return `custom-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

export function CvReviewScreen({ experiences, onChange, onContinue, onBack }: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const updateActivity = (experienceId: string, activityId: string, patch: Partial<DetectedActivity>) => {
    onChange(experiences.map((experience) => experience.id !== experienceId ? experience : {
      ...experience,
      activities: experience.activities.map((activity) => activity.id === activityId ? { ...activity, ...patch } : activity),
    }));
  };
  const removeActivity = (experienceId: string, activityId: string) => {
    onChange(experiences.map((experience) => experience.id !== experienceId ? experience : {
      ...experience,
      activities: experience.activities.filter((activity) => activity.id !== activityId),
    }));
  };
  const addActivity = (experienceId: string) => {
    const label = drafts[experienceId]?.trim();
    if (!label) return;
    onChange(experiences.map((experience) => experience.id !== experienceId ? experience : {
      ...experience,
      activities: [...experience.activities, { id: `${experienceId}-custom-${Date.now()}`, activityId: toActivityId(label), label, confirmed: true }],
    }));
    setDrafts((current) => ({ ...current, [experienceId]: "" }));
  };
  const confirmedCount = experiences.flatMap((experience) => experience.activities).filter((activity) => activity.confirmed).length;

  return (
    <section className="screen wide-screen">
      <div className="eyebrow">Review what we found</div>
      <h1>Your CV describes activities, not preferences.</h1>
      <p className="lead compact">Confirm what you actually did. You can edit the wording, remove mistakes or add something missing. We will ask what you want more or less of next.</p>
      <div className="experience-list">
        {experiences.map((experience) => (
          <article className="experience-card" key={experience.id}>
            <div className="experience-heading"><span>{experience.organisation}</span><h2>{experience.title}</h2><p>Detected activities</p></div>
            <div className="review-activities">
              {experience.activities.map((activity) => (
                <div className={activity.confirmed ? "review-activity confirmed" : "review-activity"} key={activity.id}>
                  <label className="confirm-control"><input type="checkbox" checked={activity.confirmed} onChange={(event) => updateActivity(experience.id, activity.id, { confirmed: event.target.checked })} /><span>{activity.confirmed ? "Confirmed" : "Confirm"}</span></label>
                  <input aria-label={`Edit ${activity.label}`} value={activity.label} onChange={(event) => updateActivity(experience.id, activity.id, { label: event.target.value })} />
                  <button type="button" onClick={() => removeActivity(experience.id, activity.id)}>Remove</button>
                </div>
              ))}
            </div>
            <div className="add-activity compact-add"><label htmlFor={`add-${experience.id}`}>Add a missing activity</label><div><input id={`add-${experience.id}`} value={drafts[experience.id] ?? ""} placeholder="e.g. Facilitating workshops" onChange={(event) => setDrafts((current) => ({ ...current, [experience.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addActivity(experience.id); } }} /><button className="button secondary" type="button" onClick={() => addActivity(experience.id)}>Add</button></div></div>
          </article>
        ))}
      </div>
      <p className="confirmed-count" aria-live="polite">{confirmedCount} {confirmedCount === 1 ? "activity" : "activities"} confirmed</p>
      <div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back</button><button className="button primary" type="button" disabled={confirmedCount === 0} onClick={onContinue}>Review my preferences <span aria-hidden="true">→</span></button></div>
    </section>
  );
}
