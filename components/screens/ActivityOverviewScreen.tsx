"use client";

import { useState } from "react";
import { EvidenceProvenance } from "@/components/EvidenceProvenance";
import { makeCustomActivityId, type ActivityCategory } from "@/data/activityCatalog";
import type { NormalizedActivity } from "@/types/prototype";

const categories: ActivityCategory[] = ["Research", "Analysis", "Communication", "Execution", "Product & Strategy", "Other"];
type Props = { activities: NormalizedActivity[]; onChange: (activities: NormalizedActivity[]) => void; onContinue: () => void; onBack: () => void };

export function ActivityOverviewScreen({ activities, onChange, onContinue, onBack }: Props) {
  const [draft, setDraft] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("Other");
  const add = () => {
    const label = draft.trim();
    if (!label) return;
    const canonicalId = makeCustomActivityId(label);
    onChange([...activities, { id: `evidence-${canonicalId}-${Date.now()}`, canonicalId, label, category, sources: [], recurrenceCount: 0, userAdded: true }]);
    setDraft("");
  };

  return (
    <section className="screen wide-screen">
      <div className="eyebrow">Combined across your selected experiences</div><h1>What you&apos;ve already done</h1>
      <p className="lead compact">This is not a career recommendation. We merged similar activities and kept track of which experiences support each one. These groups only organise your evidence — they are not core career values or fit criteria.</p>
      <div className="activity-groups">{categories.map((group) => {
        const grouped = activities.filter((activity) => activity.category === group);
        if (!grouped.length) return null;
        return <section className="activity-group" key={group}><h2>{group}</h2><div>{grouped.map((activity) => <article className="overview-activity" key={activity.id}><div className="overview-activity-main"><input aria-label={`Edit ${activity.label}`} value={activity.label} onChange={(event) => onChange(activities.map((item) => item.id === activity.id ? { ...item, label: event.target.value } : item))} /><button type="button" onClick={() => onChange(activities.filter((item) => item.id !== activity.id))}>Remove</button></div><EvidenceProvenance activity={activity} /></article>)}</div></section>;
      })}</div>
      <div className="add-overview-activity"><h2>Add an important missing activity</h2><p>Choose the closest organisational group, or use Other when none fits.</p><div><input value={draft} placeholder="e.g. Prioritising product opportunities" onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} /><select aria-label="Activity group" value={category} onChange={(event) => setCategory(event.target.value as ActivityCategory)}>{categories.map((item) => <option key={item}>{item}</option>)}</select><button className="button secondary" type="button" onClick={add} disabled={!draft.trim()}>Add</button></div></div>
      <div className="overview-note"><strong>{activities.length} activity areas found.</strong><span>Next, we&apos;ll select no more than 10 that are most useful for comparing your two roles.</span></div>
      <div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back</button><button className="button primary" type="button" disabled={!activities.length} onClick={onContinue}>Start evidence review <span aria-hidden="true">→</span></button></div>
    </section>
  );
}
