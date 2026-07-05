import React from 'react';

export default function GoogleSignInButton({
  onGoogleCredential,
  dir,
}: {
  onGoogleCredential: (credential: string) => Promise<void> | void;
  dir?: 'rtl' | 'ltr';
}) {
  React.useEffect(() => {
    const w = window as any;
    if (!w.google?.accounts?.id) return;

    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    try {
      w.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          const credential = response?.credential;
          if (!credential) return;
          await onGoogleCredential(credential);
        },
      });

      const el = document.getElementById('google-signin-button');
      if (!el) return;

      w.google.accounts.id.renderButton(el, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
      });
    } catch {
      // ignore
    }
  }, [onGoogleCredential]);

  return (
    <div
      id="google-signin-button"
      dir={dir}
      style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 12 }}
    />
  );
}

