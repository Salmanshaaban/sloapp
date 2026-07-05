import { ReactNode, useContext } from 'react';
import { AppContext } from '../state';
import BottomNav from './BottomNav';

export default function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { installPrompt, setInstallPrompt } = useContext(AppContext);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  return (
    <div className="page">
      <header className="top-bar">
        <div>
          <div className="brand-crest">S</div>
          <h1>{title}</h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
        <nav className="nav-links">
          <button type="button" onClick={() => window.location.hash = '/home'}>Home</button>
          <button type="button" onClick={() => window.location.hash = '/tasks'}>Tasks</button>
          <button type="button" onClick={() => window.location.hash = '/wallet'}>Wallet</button>
          <button type="button" onClick={() => window.location.hash = '/invite'}>Invite</button>
          <button type="button" onClick={() => window.location.hash = '/settings'}>Settings</button>
        </nav>
      </header>

      <main>{children}</main>
      <BottomNav />
      {installPrompt && (
        <button className="install-chip" onClick={handleInstall}>
          Install Salo
        </button>
      )}
    </div>
  );
}
