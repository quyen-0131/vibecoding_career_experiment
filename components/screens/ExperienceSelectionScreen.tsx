"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { createManualActivity, parsePastedActivities } from "@/lib/extraction/parseManualActivities";
import type { DetectedExperience, ExperienceType } from "@/types/prototype";

type Props = { experiences: DetectedExperience[]; selectedIds: string[]; onSelectionChange: (ids: string[]) => void; onExperiencesChange: Dispatch<SetStateAction<DetectedExperience[]>>; onContinue: (experiences: DetectedExperience[]) => void; onBack: () => void };

function activitySummary(experience: DetectedExperience) {
  return experience.activities.filter((activity) => activity.label.trim()).slice(0, 3).map((activity) => activity.label).join(" · ");
}

function newActivityId(experienceId: string) {
  return `${experienceId}-manual-${crypto.randomUUID()}`;
}

export function ExperienceSelectionScreen({ experiences, selectedIds, onSelectionChange, onExperiencesChange, onContinue, onBack }: Props) {
  const [editingId, setEditingId] = useState<string>();
  const [showAdd, setShowAdd] = useState(false);
  const [pastingId, setPastingId] = useState<string>();
  const [pasteDrafts, setPasteDrafts] = useState<Record<string, string>>({});
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});

  const toggle = (id: string) => selectedIds.includes(id) ? onSelectionChange(selectedIds.filter((item) => item !== id)) : selectedIds.length < 5 && onSelectionChange([...selectedIds, id]);
  const update = (id: string, patch: Partial<DetectedExperience> | ((experience: DetectedExperience) => Partial<DetectedExperience>)) => onExperiencesChange((current) => current.map((experience) => experience.id === id ? { ...experience, ...(typeof patch === "function" ? patch(experience) : patch) } : experience));
  const addExperience = () => {
    const id = `manual-experience-${Date.now()}`;
    const activityId = `${id}-manual-1`;
    onExperiencesChange([...experiences, { id, title: "", type: "work", description: "", activities: [createManualActivity("", id, activityId)] }]);
    setEditingId(id);
    setShowAdd(false);
  };
  const updateActivity = (experience: DetectedExperience, activityId: string, label: string) => update(experience.id, (current) => ({
    activities: current.activities.map((activity) => activity.id === activityId ? createManualActivity(label, current.id, activity.id) : activity),
  }));
  const addActivity = (experience: DetectedExperience) => {
    const activityId = newActivityId(experience.id);
    update(experience.id, (current) => ({ activities: [...current.activities, createManualActivity("", current.id, activityId)] }));
  };
  const removeActivity = (experience: DetectedExperience, activityId: string) => update(experience.id, (current) => ({
    activities: current.activities.filter((activity) => activity.id !== activityId),
  }));
  const addPastedActivities = (experience: DetectedExperience) => {
    const labels = parsePastedActivities(pasteDrafts[experience.id] ?? "");
    if (!labels.length) return;
    const existingLabels = new Set(experience.activities.map((activity) => activity.label.trim().toLowerCase()).filter(Boolean));
    const candidates = labels
      .filter((label) => !existingLabels.has(label.toLowerCase()))
      .map((label) => createManualActivity(label, experience.id, newActivityId(experience.id)));
    update(experience.id, { activities: [...experience.activities.filter((activity) => activity.label.trim()), ...candidates] });
    setPasteDrafts((current) => ({ ...current, [experience.id]: "" }));
    setPastingId(undefined);
  };
  const saveExperience = (experience: DetectedExperience) => {
    const title = experience.title.trim();
    const activities = experience.activities
      .filter((activity) => activity.label.trim())
      .map((activity) => createManualActivity(activity.label.trim(), experience.id, activity.id));
    if (!title || activities.length === 0) {
      setSaveErrors((current) => ({ ...current, [experience.id]: !title ? "Add a role or project title before saving." : "Add at least one activity before saving." }));
      return;
    }
    update(experience.id, { title, activities });
    setSaveErrors((current) => ({ ...current, [experience.id]: "" }));
    if (!selectedIds.includes(experience.id) && selectedIds.length < 5) onSelectionChange([...selectedIds, experience.id]);
    setEditingId(undefined);
    setPastingId(undefined);
  };

  return (
    <section className="screen wide-screen">
      <div className="eyebrow">Choose the evidence that matters</div>
      <h1>Which experiences should we learn from?</h1>
      <p className="lead compact">Choose up to five experiences that best represent the work you want this comparison to learn from.</p>
      <p className="purpose-note"><strong>Why we&apos;re asking</strong><span>The CV only suggests experiences and activities. Select the relevant experiences now, confirm the activities next, and tell us your preferences later.</span></p>
      {experiences.length === 0 && <div className="parser-notice"><strong>We read the file, but couldn&apos;t separate its experience layout.</strong><p>Some CVs arrange roles, organisations and dates in complex columns. Try the Word .docx version of your CV, or add the relevant experience below.</p></div>}
      <div className="experience-select-list">{experiences.map((experience) => {
        const selected = selectedIds.includes(experience.id);
        const editing = editingId === experience.id;
        const summary = activitySummary(experience);
        return (
          <article className={selected ? "experience-select-card selected" : "experience-select-card"} key={experience.id}>
            <button className="experience-select-main" type="button" aria-pressed={selected} disabled={!selected && selectedIds.length === 5} onClick={() => toggle(experience.id)}>
              <span className="check" aria-hidden="true">{selected ? "✓" : ""}</span>
              <span className="experience-select-copy"><strong>{experience.title || "Untitled experience"}</strong><span>{experience.organisation || "Organisation not detected"}</span>{summary ? <small>{summary}</small> : <small className="no-activity-summary">No activities extracted from this CV entry. This does not mean the role is irrelevant. Use Edit details to add what you did.</small>}</span>
            </button>
            <button className="edit-details-button" type="button" onClick={() => { setEditingId(editing ? undefined : experience.id); setPastingId(undefined); }}>{editing ? "Close editor" : "Edit details"}</button>
            {editing && <div className="experience-edit">
              <label>Role or project title<input value={experience.title} placeholder="e.g. Market Research Consultant" onChange={(event) => update(experience.id, { title: event.target.value })} /></label>
              <label>Organisation<input value={experience.organisation ?? ""} placeholder="e.g. Decision Lab" onChange={(event) => update(experience.id, { organisation: event.target.value })} /></label>
              <label>Experience type<select value={experience.type} onChange={(event) => update(experience.id, { type: event.target.value as ExperienceType })}><option value="work">Work</option><option value="internship">Internship</option><option value="project">Project</option><option value="volunteer">Volunteer</option></select></label>
              <section className="manual-activities-editor">
                <div className="manual-activities-heading"><h3>What did you actually do in this role?</h3><p>Add the main types of work you actually performed. Keep one sentence for each activity so it can be reviewed separately later.</p></div>
                <div className="manual-activity-list">{experience.activities.map((activity, index) => <div className="manual-activity-row" key={activity.id}><label>Activity {index + 1}<textarea rows={3} value={activity.label} placeholder="e.g. Analysed customer survey data to identify changes in buying behaviour." onChange={(event) => updateActivity(experience, activity.id, event.target.value)} /></label><button type="button" onClick={() => removeActivity(experience, activity.id)}>Remove</button></div>)}</div>
                <div className="manual-activity-actions"><button className="text-button" type="button" onClick={() => addActivity(experience)}>+ Add another activity</button><button className="text-button secondary-text-button" type="button" onClick={() => setPastingId(pastingId === experience.id ? undefined : experience.id)}>Paste several activities</button></div>
                {pastingId === experience.id && <div className="paste-activities"><label>Paste one activity per line<textarea rows={6} value={pasteDrafts[experience.id] ?? ""} placeholder={"Designed quantitative and qualitative research\nAnalysed customer behaviour data\nCreated strategic reports"} onChange={(event) => setPasteDrafts((current) => ({ ...current, [experience.id]: event.target.value }))} /></label><p>Lines, bullet points and semicolon-separated items become separate activities. Commas inside a sentence stay together.</p><button className="button secondary" type="button" disabled={!parsePastedActivities(pasteDrafts[experience.id] ?? "").length} onClick={() => addPastedActivities(experience)}>Add pasted activities</button></div>}
              </section>
              {saveErrors[experience.id] && <p className="experience-save-error" role="alert">{saveErrors[experience.id]}</p>}
              <button className="button primary save-experience-button" type="button" onClick={() => saveExperience(experience)}>Save experience</button>
            </div>}
          </article>
        );
      })}</div>
      <div className="manual-experience-action"><button className="text-button" type="button" onClick={() => setShowAdd(!showAdd)}>+ Add a missing experience</button>{showAdd && <div className="manual-add-prompt"><p>Add one experience, then list each activity separately.</p><button className="button secondary" type="button" onClick={addExperience}>Add experience</button></div>}</div>
      <div className="selection-helper"><span>{selectedIds.length} of 5 selected</span><p>We&apos;ll combine evidence across these experiences rather than treating every job separately.</p>{selectedIds.length === 0 && <strong>Select at least 1 experience to continue.</strong>}</div>
      <div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back</button><button className="button primary" type="button" disabled={selectedIds.length < 1 || selectedIds.length > 5} onClick={() => onContinue(experiences)}>Find activities in these experiences <span aria-hidden="true">→</span></button></div>
    </section>
  );
}
