import React, { useState } from 'react';
import { Car, Loader2, AlertCircle } from 'lucide-react';
import { COLORS, FONT_DISPLAY, FONT_BODY } from '../../styles/theme';
import { TextField } from '../common/TextField';
import { PrimaryButton } from '../common/PrimaryButton';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } from '../../auth';

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.87 2.69-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.96 10.71A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

const ERROR_MESSAGES = {
  'auth/invalid-email': 'That email address doesn\u2019t look right.',
  'auth/user-not-found': 'No account found with that email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account already exists with that email — try signing in instead.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/popup-closed-by-user': null, // user just closed the Google popup — not a real error
  'auth/network-request-failed': 'Network error — check your connection and try again.',
};

export default function LoginPage() {
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [resetSent, setResetSent] = useState(false);

  const handleError = (err) => {
    const known = ERROR_MESSAGES[err.code];
    if (known === null) return; // silently ignore (e.g. closed popup)
    setError(known || 'Something went wrong. Please try again.');
  };

  const handleGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = async () => {
    setError(null);
    if (!email || !password) { setError('Enter both email and password.'); return; }
    setBusy(true);
    try {
      if (mode === 'signup') await signUpWithEmail(email, password);
      else await signInWithEmail(email, password);
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!email) { setError('Enter your email above first, then tap "Forgot password".'); return; }
    setError(null);
    setBusy(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      background: COLORS.bg, minHeight: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 20px', fontFamily: FONT_BODY, color: COLORS.paper
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: COLORS.blue, display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px'
          }}>
            <Car size={26} color="#FFFFFF" />
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, textTransform: 'uppercase', letterSpacing: 0.5 }}>Garage Log</div>
          <div style={{ fontSize: 13, color: COLORS.steel, marginTop: 4 }}>Sign in to sync your garage across devices</div>
        </div>

        <div className="csl-card" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 22 }}>
          <button
            onClick={handleGoogle}
            disabled={busy}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: '11px 16px',
              fontFamily: FONT_BODY, fontWeight: 600, fontSize: 14, color: COLORS.paper, cursor: busy ? 'default' : 'pointer',
              opacity: busy ? 0.6 : 1
            }}
          >
            <GoogleGlyph /> Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: COLORS.line }} />
            <span style={{ fontSize: 11, color: COLORS.steelDim, textTransform: 'uppercase', letterSpacing: 0.5 }}>or email</span>
            <div style={{ flex: 1, height: 1, background: COLORS.line }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TextField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <TextField label="Password" type="password" value={password} onChange={setPassword} placeholder={mode === 'signup' ? 'At least 6 characters' : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'} />

            {mode === 'signin' && (
              <button
                onClick={handleReset}
                disabled={busy}
                style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: COLORS.blue, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Forgot password?
              </button>
            )}

            {resetSent && (
              <div style={{ fontSize: 12, color: COLORS.green }}>Password reset email sent — check your inbox.</div>
            )}
            {error && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: 12, color: COLORS.rust }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ marginTop: 4 }}>
              <PrimaryButton full disabled={busy} onClick={handleEmailSubmit}>
                {busy ? <Loader2 size={16} className="csl-spin" style={{ display: 'inline-block', verticalAlign: 'middle' }} /> : (mode === 'signup' ? 'Create account' : 'Sign in')}
              </PrimaryButton>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12.5, color: COLORS.steel }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setResetSent(false); }}
            style={{ background: 'none', border: 'none', color: COLORS.blue, fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 12.5 }}
          >
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
