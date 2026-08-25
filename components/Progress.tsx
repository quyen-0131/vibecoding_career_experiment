import type { Step } from "@/types/prototype";

const stepLabels = ["Introduction", "Compare careers", "Add your CV", "Choose experiences", "Confirm activities", "Review your evidence", "Plan an experiment"];

const phaseForStep = (step: Step) => {
  if (step <= 5) return { number: 1, label: "Find your existing evidence" };
  if (step === 6) return { number: 2, label: "Find your uncertainty" };
  return { number: 3, label: "Plan a career experiment" };
};

export function Progress({ step }: { step: Step }) {
  const phase = phaseForStep(step);
  return (
    <div className="progress-wrap">
      <div className="progress-meta"><span>Phase {phase.number} of 3 · {phase.label}</span><span>{stepLabels[step - 1]}</span></div>
      <div className="progress-track" role="progressbar" aria-label={`Phase ${phase.number} of 3. ${phase.label}. Current step: ${stepLabels[step - 1]}.`} aria-valuemin={1} aria-valuemax={7} aria-valuenow={step}>
        <div className="progress-fill" style={{ width: `${(step / 7) * 100}%` }} />
      </div>
    </div>
  );
}