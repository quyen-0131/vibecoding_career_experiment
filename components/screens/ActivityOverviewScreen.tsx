"use client";

import { useEffect, useRef, useState } from "react";
import { EvidenceProvenance } from "@/components/EvidenceProvenance";
import { getActivityDefinition, makeCustomActivityId, type ActivityCategory } from "@/data/activityCatalog";
import { getCareerModel, type CareerId } from "@/data/careers";
import { analyzeResumeEvidence } from "@/lib/analysis/analyzeResumeEvidence";
import { mergeNormalizedActivities } from "@/lib/evidence/normalizeActivities";
import { makeUnmappedComponent, mapActivityToCareers, mapActivityToSemanticComponents, mapNormalizedActivity } from "@/lib/evidence/semanticActivityMapping";
import type { NormalizedActivity, SemanticActivityComponent } from "@/types/prototype";

const categories: ActivityCategory[] = ["Research", "Analysis", "Communication", "Planning & Design", "Product & Strategy", "Written Work", "Execution", "Other"];
type Props = { activities: NormalizedActivity[]; careers: CareerId[]; onChange: (activities: NormalizedActivity[]) => void; onContinue: () => void; onBack: () => void };

export function ActivityOverviewScreen({ activities, careers, onChange, onContinue, onBack }: Props) {
  const [draft, setDraft] = useState("");
  const hasReconciled = useRef(false);
  const roles = careers.map((careerId) => ({ id: careerId, title: getCareerModel(careerId)?.title ?? careerId }));

  useEffect(() => {
    if (hasReconciled.current) return;
    hasReconciled.current = true;
    const corrected = activities.map((activity) => {
      const mapped = mapNormalizedActivity(activity, careers);
      const originalEvidence = activity.originalEvidence?.length
        ? activity.originalEvidence
        : activity.sources.map((source, index) => ({
            ...source,
            label: activity.originalLabels[index] ?? activity.originalLabel,
          }));
      return { ...activity, ...mapped, originalEvidence };
    });
    const consolidated = mergeNormalizedActivities(corrected, careers);
    const before = activities.map((activity) => `${activity.canonicalId}:${activity.label}:${activity.sources.length}`).join("|");
    const after = consolidated.map((activity) => `${activity.canonicalId}:${activity.label}:${activity.sources.length}`).join("|");
    if (before !== after || activities.some((activity) => !activity.originalEvidence)) onChange(consolidated);
  }, [activities, careers, onChange]);

  const update = (id: string, patch: Partial<NormalizedActivity>, merge = false) => {
    const updated = activities.map((item) => item.id === id ? { ...item, ...patch } : item);
    onChange(merge ? mergeNormalizedActivities(updated, careers) : updated);
  };

  const analyseEditedText = (activity: NormalizedActivity, label: string) => {
    const source = activity.sources[0];
    const analysis = analyzeResumeEvidence({
      text: label,
      source: source ? { experienceId: source.experienceId, title: source.title, organisation: source.organisation } : undefined,
      roles,
    });
    const inferred = analysis.skills[0];
    const semantic = mapActivityToSemanticComponents(label);
    const canonicalId = inferred?.skillId ?? semantic.components[0]?.canonicalActivityId ?? makeCustomActivityId(label);
    const definition = getActivityDefinition(canonicalId);
    const components: SemanticActivityComponent[] = inferred
      ? [{
          canonicalActivityId: inferred.skillId,
          label: inferred.label,
          evidenceType: inferred.basis,
          confidence: inferred.confidence,
          rationale: inferred.reason,
          confirmedByUser: true,
        }]
      : semantic.components.length
        ? semantic.components
        : [makeUnmappedComponent(label)];
    const careerTransfers = mapActivityToCareers(components, careers);
    const hasMapped = careers.some((careerId) => careerTransfers[careerId]?.relationship !== "unknown");
    const hasUnknown = careers.some((careerId) => careerTransfers[careerId]?.relationship === "unknown");
    return {
      canonicalId,
      label: definition?.label ?? inferred?.label ?? semantic.normalizedLabel ?? label,
      category: definition?.category ?? inferred?.category ?? semantic.category ?? activity.category,
      components,
      careerTransfers,
      mappingStatus: (hasMapped ? (hasUnknown ? "partial" : "mapped") : "unknown") as NormalizedActivity["mappingStatus"],
      userAdded: !definition,
      resumeEvidence: [analysis.evidence],
      skillInferences: analysis.skills,
      skillRoleRelevance: analysis.roleRelevance,
    };
  };

  const remapEditedLabel = (activity: NormalizedActivity, editedLabel: string) => {
    const label = editedLabel.trim();
    if (!label) return;
    update(activity.id, analyseEditedText(activity, label), true);
  };

  const add = () => {
    const originalLabel = draft.trim();
    if (!originalLabel) return;
    const canonicalId = makeCustomActivityId(originalLabel);
    const base: NormalizedActivity = {
      id: `evidence-${canonicalId}-manual`,
      canonicalId,
      originalLabel,
      originalLabels: [originalLabel],
      originalEvidence: [],
      label: originalLabel,
      category: "Other",
      sources: [],
      recurrenceCount: 0,
      components: [makeUnmappedComponent(originalLabel)],
      careerTransfers: {},
      mappingStatus: "unknown",
      userAdded: true,
    };
    onChange(mergeNormalizedActivities([...activities, { ...base, ...analyseEditedText(base, originalLabel) }], careers));
    setDraft("");
  };

  return (
    <section className="screen wide-screen">
      <div className="eyebrow">Confirm your existing evidence</div>
      <h1>Are these the activities you&apos;ve tried?</h1>
      <p className="lead compact">We turned CV sentences into shorter activity names and grouped similar work together. These groups are navigation aids, not core career values or fit criteria. Edit anything unclear, remove anything incorrect, and add important work we missed.</p>
      <p className="purpose-note"><strong>Why we&apos;re asking</strong><span>A CV suggestion is not yet a fact about you. Everything you leave on this screen will count as confirmed experience. We&apos;ll ask what you want more or less of later.</span></p>
      <div className="activity-groups">{categories.map((group) => {
        const grouped = activities.filter((activity) => activity.category === group);
        if (!grouped.length) return null;
        return (
          <section className="activity-group" key={group} aria-labelledby={`activity-group-${group.replace(/\W+/g, "-").toLowerCase()}`}>
            <header className="activity-group-header">
              <h2 id={`activity-group-${group.replace(/\W+/g, "-").toLowerCase()}`}>{group === "Other" ? "Other activities" : group}</h2>
              <span>{grouped.length} {grouped.length === 1 ? "activity" : "activities"}</span>
            </header>
            <div>{grouped.map((activity) => (
              <article className="overview-activity semantic-overview-activity" key={activity.id}>
                <div className="overview-activity-main">
                  <label><span className="visually-hidden">Edit activity name</span><input aria-label={`Edit ${activity.label}`} value={activity.label} onChange={(event) => update(activity.id, { label: event.target.value })} onBlur={(event) => remapEditedLabel(activity, event.currentTarget.value)} /></label>
                  <button type="button" aria-label={`Remove ${activity.label}`} onClick={() => onChange(activities.filter((item) => item.id !== activity.id))}>Remove</button>
                </div>
                <EvidenceProvenance activity={activity} />
                {((activity.originalEvidence?.length ?? 0) > 0 || activity.originalLabels.length > 0) && (
                  <details className="semantic-details">
                    <summary>See original CV wording</summary>
                    <ul className="semantic-original-list">
                      {(activity.originalEvidence?.length ?? 0) > 0
                        ? activity.originalEvidence!.map((evidence) => (
                            <li key={`${evidence.experienceId}-${evidence.label}`}>
                              <strong>{evidence.title}{evidence.organisation ? ` - ${evidence.organisation}` : ""}</strong>
                              <q>{evidence.label}</q>
                            </li>
                          ))
                        : activity.originalLabels.map((label) => <li key={label}><q>{label}</q></li>)}
                    </ul>
                  </details>
                )}
              </article>
            ))}</div>
          </section>
        );
      })}</div>
      <div className="add-overview-activity">
        <h2>Add a missing activity</h2>
        <p>Use one sentence for one type of work. We&apos;ll keep your original wording and show the shorter activity label separately.</p>
        <div><input aria-label="Missing activity" value={draft} placeholder="For example: Liaised with government authorities to deliver a programme" onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} /><button className="button secondary" type="button" onClick={add} disabled={!draft.trim()}>Add activity</button></div>
      </div>
      <div className="overview-note"><strong>{activities.length} activities ready to confirm.</strong><span>Next, we&apos;ll select no more than 10 and review them group by group.</span></div>
      <div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back to experiences</button><button className="button primary" type="button" disabled={!activities.length} onClick={onContinue}>Confirm my activities <span aria-hidden="true">-&gt;</span></button></div>
    </section>
  );
}
