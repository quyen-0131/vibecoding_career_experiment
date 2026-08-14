export function ExperimentPlaceholderScreen({ question, onBack }: { question: string; onBack: () => void }) {
  return (
    <section className="screen placeholder-screen">
      <div className="placeholder-mark" aria-hidden="true">Next</div>
      <div className="eyebrow">The next prototype</div>
      <h1>Your career experiment</h1>
      <p className="lead compact">In the next prototype, we&apos;ll turn the question you selected into a realistic task that gives you new evidence about yourself.</p>
      <div className="question-being-tested"><span>Question being tested</span><strong>{question}</strong></div>
      <button className="button ghost" type="button" onClick={onBack}>Back to my question</button>
    </section>
  );
}
