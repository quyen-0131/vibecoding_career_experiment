import { careers, type CareerId } from "@/data/careers";

type Props = { selected: CareerId[]; onToggle: (career: CareerId) => void; onContinue: () => void; onBack: () => void };

export function CareerSelectionScreen({ selected, onToggle, onContinue, onBack }: Props) {
  return (
    <section className="screen wide-screen">
      <div className="eyebrow">Choose two roles</div>
      <h1>Which two roles are you considering?</h1>
      <p className="lead compact">Choose two roles you genuinely want to compare. We&apos;ll use your past experience to understand what you already know — and what still needs testing.</p>
      <div className="career-grid flat-career-grid">
        {careers.map((career) => {
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
      <div className="selection-count" aria-live="polite">{selected.length} of 2 selected</div>
      <div className="actions"><button className="button ghost" onClick={onBack}>Back</button><button className="button primary" disabled={selected.length !== 2} onClick={onContinue}>Continue <span aria-hidden="true">→</span></button></div>
    </section>
  );
}
