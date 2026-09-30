import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function OrganizerLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profileSnapshot = await getDoc(doc(db, 'organizers', credential.user.uid));
      const profile = profileSnapshot.exists() ? profileSnapshot.data() : {};

      if (profile.active === false) {
        setError('This organizer account has been deactivated.');
        return;
      }

      onLoginSuccess({
        ...profile,
        organizerId: credential.user.uid,
        email: credential.user.email,
        fullName: profile.fullName || credential.user.email,
      });
    } catch (err) {
      const messages = {
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/invalid-email': 'Enter a valid organizer email address.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/user-disabled': 'This organizer account has been disabled.',
      };
      setError(messages[err.code] || `Login error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-card" aria-labelledby="organizer-login-heading">
      <p className="eyebrow">Restricted access</p>
      <h2 id="organizer-login-heading" className="login-heading">Organizer authorization</h2>
      <p className="login-copy">
        Sign in to register athletes, review credentials, and issue secure verification records.
      </p>

      {error && <div className="error-banner" role="alert">{error}</div>}

      <form onSubmit={handleLogin} className="form-stack login-form">
        <label className="field-group">
          <span className="field-label">Official email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="organizer@example.com"
            className="field-input"
            autoComplete="email"
            required
          />
        </label>

        <label className="field-group">
          <span className="field-label">Security password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="field-input"
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" disabled={loading} className="primary-button full-width">
          {loading ? 'AUTHENTICATING...' : 'UNLOCK ORGANIZER PORTAL'}
        </button>
      </form>

      <div className="status-line">
        <span className="status-dot" aria-hidden="true" />
        End-to-end credential ledger online
      </div>
    </section>
  );
}
