import type { UncertaintyChoice } from "@/types/prototype";

export function UncertaintyConfirmationScreen({ choice, onBack, onContinue }: { choice: UncertaintyChoice; onBack: () => void; onContinue: () => void }) {
  return (
    <section className="screen confirmation-screen">
      <div className="eyebrow">Confirm the learning goal</div>
      <h1>Ready to turn this question into an experiment?</h1>
      <div className="confirmation-card"><section><span>What you want to learn</span><h2>{choice.question}</h2></section><section><span>Why this experiment could be informative</span><p>{choice.whyInformative}</p></section></div>
      <p className="self-assessment-note">This confirms the question only. The real experiment is not part of this prototype.</p>
      <div className="actions"><button className="button ghost" type="button" onClick={onBack}>Choose a different question</button><button className="button primary" type="button" onClick={onContinue}>Create my experiment <span aria-hidden="true">→</span></button></div>
    </section>
  );
}
