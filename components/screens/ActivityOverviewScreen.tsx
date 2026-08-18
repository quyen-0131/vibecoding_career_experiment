"use client";

import { useState } from "react";
import { EvidenceProvenance } from "@/components/EvidenceProvenance";
import { activityCatalog, getActivityDefinition, makeCustomActivityId, type ActivityCategory } from "@/data/activityCatalog";
import type { CareerId } from "@/data/careers";
import { makeUnmappedComponent, mapActivityToCareers, mapActivityToSemanticComponents, mapNormalizedActivity } from "@/lib/evidence/semanticActivityMapping";
import type { NormalizedActivity, SemanticActivityComponent } from "@/types/prototype";

const categories: ActivityCategory[] = ["Research", "Analysis", "Communication", "Planning & Design", "Product & Strategy", "Written Work", "Execution", "Other"];
type Props = { activities: NormalizedActivity[]; careers: CareerId[]; onChange: (activities: NormalizedActivity[]) => void; onContinue: () => void; onBack: () => void };

export function ActivityOverviewScreen({ activities, careers, onChange, onContinue, onBack }: Props) {
  const [draft, setDraft] = useState("");

  const [componentDrafts, setComponentDrafts] = useState<Record<string, string>>({});

  const update = (id: string, patch: Partial<NormalizedActivity>) => onChange(activities.map((item) => item.id === id ? { ...item, ...patch } : item));
  const applyComponents = (activity: NormalizedActivity, components: SemanticActivityComponent[]) => {
    const careerTransfers = mapActivityToCareers(components, careers);
    const hasUnknown = careers.some((careerId) => careerTransfers[careerId]?.relationship === "unknown");
    update(activity.id, {
      canonicalId: components[0]?.canonicalActivityId ?? activity.canonicalId,
      components,
      careerTransfers,
      mappingStatus: components.length ? (hasUnknown ? "partial" : "mapped") : "unknown",
    });
  };

  const remapEditedLabel = (activity: NormalizedActivity, editedLabel: string) => {
    const label = editedLabel.trim();
    if (!label) return;
    const semantic = mapActivityToSemanticComponents(label);
    const components = semantic.components.length
      ? semantic.components
      : [makeUnmappedComponent(label)];
    const careerTransfers = mapActivityToCareers(components, careers);
    const hasUnknown = careers.some((careerId) => careerTransfers[careerId]?.relationship === "unknown");
    update(activity.id, {
      canonicalId: components[0].canonicalActivityId,
      label,
      category: semantic.components.length ? semantic.category : activity.category,
      components,
      careerTransfers,
      mappingStatus: semantic.components.length ? (hasUnknown ? "partial" : "mapped") : "unknown",
    });
  };
  const add = () => {
    const originalLabel = draft.trim();
    if (!originalLabel) return;
    const canonicalId = makeCustomActivityId(originalLabel);
    const base: NormalizedActivity = {
      id: `evidence-${canonicalId}-${Date.now()}`,
      canonicalId,
      originalLabel,
      originalLabels: [originalLabel],
      label: originalLabel,
      category: "Other",
      sources: [],
      recurrenceCount: 0,
      components: [makeUnmappedComponent(originalLabel)],
      careerTransfers: {},
      mappingStatus: "unknown",
      userAdded: true,
    };
    const mapped = mapNormalizedActivity(base, careers);
    onChange([...activities, { ...base, ...mapped }]);
    setDraft("");
  };

  const addComponent = (activity: NormalizedActivity) => {
    const componentId = componentDrafts[activity.id];
    const definition = getActivityDefinition(componentId);
    if (!definition || activity.components.some((item) => item.canonicalActivityId === componentId)) return;
    applyComponents(activity, [...activity.components, {
      canonicalActivityId: definition.id,
      label: definition.label,
      evidenceType: "explicit",
      confidence: "high",
      rationale: "Confirmed by the user during evidence review.",
      confirmedByUser: true,
    }]);
    setComponentDrafts((current) => ({ ...current, [activity.id]: "" }));
  };

  return (
    <section className="screen wide-screen">
      <div className="eyebrow">Combined across your selected experiences</div>
      <h1>What you&apos;ve already done</h1>
      <p className="lead compact">We translated your original sentences into concise, transferable types of work. These groups are reading aids, not core career values or fit criteria. Open any activity to see the original wording and the explicit or inferred components behind it.</p>
      <div className="activity-groups">{categories.map((group) => {
        const grouped = activities.filter((activity) => activity.category === group);
        if (!grouped.length) return null;
        return (
          <section className="activity-group" key={group}>
            <h2>{group === "Other" ? "Other transferable work" : group}</h2>
            <div>{grouped.map((activity) => (
              <article className="overview-activity semantic-overview-activity" key={activity.id}>
                <div className="overview-activity-main">
                  <label><span className="visually-hidden">Edit transferable wording</span><input aria-label={`Edit ${activity.label}`} value={activity.label} onChange={(event) => update(activity.id, { label: event.target.value })} onBlur={(event) => remapEditedLabel(activity, event.currentTarget.value)} /></label>

                  <button type="button" onClick={() => onChange(activities.filter((item) => item.id !== activity.id))}>Remove</button>
                </div>
                <EvidenceProvenance activity={activity} />
                {activity.mappingStatus === "unknown" && <p className="mapping-warning">Not yet mapped confidently. This means the evidence is unclear, not that the work is unimportant. Edit the transferable wording or add a supported component below.</p>}
                <details className="semantic-details">
                  <summary>Original wording, mapping and category</summary>
                  <label className="semantic-category-control"><span>Activity group</span><select aria-label={`Category for ${activity.label}`} value={activity.category} onChange={(event) => update(activity.id, { category: event.target.value as ActivityCategory })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
                  <div className="semantic-original">
                    <span>Original evidence</span>
                    <q>{activity.originalLabel}</q>
                    {activity.label !== activity.originalLabel && <button type="button" onClick={() => update(activity.id, { label: activity.originalLabel })}>Restore original wording</button>}
                  </div>
                  <div className="semantic-components">
                    <span>Components to confirm</span>
                    {activity.components.length ? <ul>{activity.components.map((component) => (
                      <li key={component.canonicalActivityId}>
                        <div><strong>{component.label}</strong><em>{component.confirmedByUser ? "Confirmed" : component.evidenceType === "explicit" ? "Explicit" : "Inferred"} · {component.confidence} confidence</em><p>{component.rationale}</p></div>
                        <div className="semantic-component-actions">
                          {!component.confirmedByUser && <button type="button" onClick={() => applyComponents(activity, activity.components.map((item) => item.canonicalActivityId === component.canonicalActivityId ? { ...item, confirmedByUser: true } : item))}>Confirm</button>}
                          <button type="button" onClick={() => applyComponents(activity, activity.components.filter((item) => item.canonicalActivityId !== component.canonicalActivityId))}>Reject</button>
                        </div>
                      </li>
                    ))}</ul> : <p>No supported component has been confirmed yet.</p>}
                    <div className="semantic-component-add">
                      <select aria-label={`Add a transferable component to ${activity.label}`} value={componentDrafts[activity.id] ?? ""} onChange={(event) => setComponentDrafts((current) => ({ ...current, [activity.id]: event.target.value }))}>
                        <option value="">Add a missing component…</option>
                        {activityCatalog.filter((definition) => !activity.components.some((item) => item.canonicalActivityId === definition.id)).map((definition) => <option value={definition.id} key={definition.id}>{definition.label}</option>)}
                      </select>
                      <button type="button" disabled={!componentDrafts[activity.id]} onClick={() => addComponent(activity)}>Add</button>
                    </div>
                  </div>
                </details>
              </article>
            ))}</div>
          </section>
        );
      })}</div>
      <div className="add-overview-activity">
        <h2>Add an important missing activity</h2>
        <p>Write one sentence. We&apos;ll turn it into a concise transferable activity while preserving your wording.</p>
        <div><input value={draft} placeholder="e.g. Liaised with government authorities to deliver a programme" onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} /><button className="button secondary" type="button" onClick={add} disabled={!draft.trim()}>Add</button></div>
      </div>
      <div className="overview-note"><strong>{activities.length} transferable activity areas found.</strong><span>Next, we&apos;ll select no more than 10 that are most useful for comparing your two roles.</span></div>
      <div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back</button><button className="button primary" type="button" disabled={!activities.length} onClick={onContinue}>Start evidence review <span aria-hidden="true">→</span></button></div>
    </section>
  );
}
