"use client";

import { useState } from "react";
import { careers, type CareerId } from "@/data/careers";

type Props = { selected: CareerId[]; onToggle: (career: CareerId) => void; onContinue: () => void; onBack: () => void };

export function CareerSelectionScreen({ selected, onToggle, onContinue, onBack }: Props) {
  const [query, setQuery] = useState("");
  const visibleCareers = careers.filter((career) => career.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <section className="screen wide-screen">
      <div className="eyebrow">Choose two roles</div>
      <h1>Which two roles are you considering?</h1>
      <p className="lead compact">Choose two roles you genuinely want to compare. Selecting a role here is not a commitment.</p>
      <p className="purpose-note"><strong>Why we&apos;re asking</strong><span>Your two choices tell us which past activities and unanswered questions matter for your decision.</span></p>
      <label className="career-search">Search roles<input type="search" value={query} placeholder="Type a role title" onChange={(event) => setQuery(event.target.value)} /></label>
      <div className="career-grid flat-career-grid">
        {visibleCareers.map((career) => {
          const active = selected.includes(career.id);
          const disabled = !active && selected.length === 2;
          return (
            <button className={active ? "career-card selected" : "career-card"} key={career.id} type="button" aria-pressed={active} disabled={disabled} onClick={() => onToggle(career.id)}>
              <span className="check" aria-hidden="true">{active ? "✓" : ""}</span>
              <span>{career.title}</span>
            </button>
          );
        })}
      </div>
      {visibleCareers.length === 0 && <p className="career-search-empty">No role in the current prototype catalogue matches that search.</p>}
      <div className="selection-count" aria-live="polite">{selected.length} of 2 selected</div>
      <div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back</button><button className="button primary" type="button" disabled={selected.length !== 2} onClick={onContinue}>Use these two careers <span aria-hidden="true">→</span></button></div>
    </section>
  );
}
