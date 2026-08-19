export function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <section className="screen welcome-screen">
      <div className="eyebrow">The Career Experiment</div>
      <h1>Explore careers through evidence, not guesswork.</h1>
      <p className="lead">Use your past experiences to understand what kinds of work you enjoy — and identify what you still need to test before committing to a career.</p>
      <button className="button primary" type="button" onClick={onContinue}>Start exploring <span aria-hidden="true">→</span></button>
      <p className="microcopy">No perfect answers needed. We&apos;ll start with what you already know.</p>
    </section>
  );
}
