import type { Step } from "@/types/prototype";

const labels = ["Welcome", "Roles", "CV", "Experiences", "Activity overview", "Evidence", "Experiment"];

export function Progress({ step }: { step: Step }) {
  return (
    <div className="progress-wrap" aria-label={`Step ${step} of 7: ${labels[step - 1]}`}>
      <div className="progress-meta"><span>Step {step} of 7</span><span>{labels[step - 1]}</span></div>
      <div className="progress-track" aria-hidden="true"><div className="progress-fill" style={{ width: `${(step / 7) * 100}%` }} /></div>
    </div>
  );
}
