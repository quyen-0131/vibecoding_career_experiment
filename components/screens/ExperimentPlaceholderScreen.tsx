export function ExperimentPlaceholderScreen({ onBack }: { onBack: () => void }) {
  return (
    <section className="screen placeholder-screen">
      <div className="placeholder-mark" aria-hidden="true">Next</div>
      <div className="eyebrow">The next prototype</div>
      <h1>Career experiments are coming in the next prototype.</h1>
      <p className="lead compact">This sprint stops here. Your evidence map has identified what a future career experiment should help you test.</p>
      <button className="button ghost" type="button" onClick={onBack}>Back to my evidence map</button>
    </section>
  );
}
