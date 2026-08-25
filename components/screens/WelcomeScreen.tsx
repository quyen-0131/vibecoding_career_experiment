export function WelcomeScreen({
  onContinue,
  onStartDemo,
}: {
  onContinue: () => void;
  onStartDemo: () => void;
}) {
  return (
    <section className="screen welcome-screen">
      <div className="eyebrow">An evidence-based career decision prototype</div>
      <h1>Don&apos;t choose a career from a quiz. Test it.</h1>
      <p className="lead">We&apos;ll use what you&apos;ve already done to identify what you know and what you still need to experience before choosing between two career paths.</p>
      <ol className="phase-roadmap" aria-label="How the prototype works">
        <li><span>1</span><div><strong>Find your existing evidence</strong><p>Your CV helps us find activities you have already tried. Doing something before does not mean you enjoyed it.</p></div></li>
        <li><span>2</span><div><strong>Find your uncertainty</strong><p>You tell us which activities you want more or less of. We compare that with what each career involves.</p></div></li>
        <li><span>3</span><div><strong>Plan a career experiment</strong><p>You choose an unanswered question. The prototype turns it into a bounded piece of work to test next.</p></div></li>
      </ol>
      <div className="welcome-outcome"><strong>Your result</strong><p>An evidence map and a proposed next test. Not a fit score, personality verdict, or definitive career answer.</p></div>
      <div className="welcome-actions">
        <button className="button primary" type="button" onClick={onStartDemo}>Try the 5-minute guided demo <span aria-hidden="true">→</span></button>
        <button className="button secondary" type="button" onClick={onContinue}>Use my own CV</button>
      </div>
      <p className="welcome-demo-note">
        The guided demo uses fictional sample data and pre-written evaluation
        examples. It does not use API credit.
      </p>
    </section>
  );
}