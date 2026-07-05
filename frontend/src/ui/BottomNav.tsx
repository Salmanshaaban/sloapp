export default function BottomNav() {
  const goTo = (path: string) => {
    window.location.hash = path;
  };

  return (
    <nav className="bottom-nav">
      <button type="button" onClick={() => goTo('/home')}>Home</button>
      <button type="button" onClick={() => goTo('/tasks')}>Tasks</button>
      <button type="button" onClick={() => goTo('/wallet')}>Wallet</button>
      <button type="button" onClick={() => goTo('/invite')}>Invite</button>
      <button type="button" onClick={() => goTo('/settings')}>Settings</button>
    </nav>
  );
}
