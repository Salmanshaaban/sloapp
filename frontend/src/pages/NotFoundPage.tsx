import PageShell from '../ui/PageShell';

export default function NotFoundPage() {
  return (
    <PageShell title="Page Not Found" subtitle="The page you are looking for cannot be found.">
      <div className="card section-card">
        <h2>Oops.</h2>
        <p className="subtitle">This page is not available in the Salo app.</p>
        <button type="button" className="primary-button" onClick={() => window.location.hash = '/home'}>Back to Dashboard</button>
      </div>
    </PageShell>
  );
}
