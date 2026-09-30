import { useState } from 'react';
import OrganizerLogin from './components/OrganizerLogin';
import OrganizerDashboard from './components/OrganizerDashboard';
import AthleteDashboard from './components/AthleteDashboard';
import PublicVerify from './components/PublicVerify';
import './App.css';

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 17.5 8.5 13l3 3L20 7.5" />
        <path d="M15 7.5h5v5" />
      </svg>
    </span>
  );
}

export default function App() {
  const [portal, setPortal] = useState('organizer');
  const [organizerUser, setOrganizerUser] = useState(null);
  const [verifyId] = useState(() => new URLSearchParams(window.location.search).get('verify'));

  if (verifyId) {
    return (
      <div className="app-shell verify-page">
        <PublicVerify athleteId={verifyId} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <BrandMark />
          <div>
            <p className="brand-kicker">Credential network / 02</p>
            <h1 className="brand-name">SECURESPORTS VAULT</h1>
            <p className="brand-subtitle">Verified athlete credentials, built for the field.</p>
          </div>
        </div>

        <nav className="portal-switcher" aria-label="Choose a portal">
          <button
            type="button"
            onClick={() => setPortal('organizer')}
            className={`portal-button ${portal === 'organizer' ? 'active' : ''}`}
          >
            ORGANIZER PORTAL
          </button>
          <button
            type="button"
            onClick={() => setPortal('athlete')}
            className={`portal-button ${portal === 'athlete' ? 'active' : ''}`}
          >
            ATHLETE PORTAL
          </button>
        </nav>
      </header>

      <main className="content-frame">
        {portal === 'organizer' ? (
          organizerUser ? (
            <div className="organizer-shell">
              <div className="organizer-banner">
                <p>
                  Authorized official <strong>{organizerUser.fullName}</strong>
                </p>
                <button type="button" onClick={() => setOrganizerUser(null)} className="danger-button">
                  SIGN OUT
                </button>
              </div>
              <OrganizerDashboard organizerId={organizerUser.organizerId || 'demo_organizer_01'} />
            </div>
          ) : (
            <OrganizerLogin onLoginSuccess={(userData) => setOrganizerUser(userData)} />
          )
        ) : (
          <AthleteDashboard />
        )}
      </main>
    </div>
  );
}
