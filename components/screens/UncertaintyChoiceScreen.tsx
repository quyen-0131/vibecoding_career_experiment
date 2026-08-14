import type { UncertaintyChoice } from "@/types/prototype";

type Props = { choices: UncertaintyChoice[]; selectedId?: string; onSelect: (id: string) => void; onContinue: () => void; onBack: () => void };

export function UncertaintyChoiceScreen({ choices, selectedId, onSelect, onContinue, onBack }: Props) {
  return (
    <section className="screen wide-screen">
      <div className="eyebrow">You choose the question</div>
      <h1>What would you like to learn next?</h1>
      <p className="lead compact">Your past experience cannot answer everything. Choose the question that would help you feel more informed about these two roles.</p>
      <div className="uncertainty-grid">{choices.map((choice) => <button className={selectedId === choice.id ? `uncertainty-card selected uncertainty-${choice.type}` : `uncertainty-card uncertainty-${choice.type}`} type="button" key={choice.id} aria-pressed={selectedId === choice.id} onClick={() => onSelect(choice.id)}><span>{choice.label}</span><strong>{choice.title}</strong><p>{choice.supportingText}</p></button>)}</div>
      <p className="choice-principle"><strong>The app designs the experiment.</strong> You choose the question you want evidence about.</p>
      <div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back to starting evidence</button><button className="button primary" type="button" disabled={!selectedId} onClick={onContinue}>Continue <span aria-hidden="true">→</span></button></div>
    </section>
  );
}
