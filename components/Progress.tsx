import type { Step } from "@/types/prototype";

const labels = ["Welcome", "Roles", "CV", "Experiences", "Activity overview", "Evidence tunnel", "Priorities", "Starting evidence", "Choose uncertainty", "Confirm question", "Next prototype"];

export function Progress({ step }: { step: Step }) {
  return (
    <div className="progress-wrap" aria-label={`Step ${step} of 11: ${labels[step - 1]}`}>
      <div className="progress-meta"><span>Step {step} of 11</span><span>{labels[step - 1]}</span></div>
      <div className="progress-track" aria-hidden="true"><div className="progress-fill" style={{ width: `${(step / 11) * 100}%` }} /></div>
    </div>
  );
}
