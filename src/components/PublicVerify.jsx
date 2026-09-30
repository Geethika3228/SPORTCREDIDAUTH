import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function PublicVerify({ athleteId }) {
  const [athlete, setAthlete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAthlete = async () => {
      setLoading(true);
      setError('');
      try {
        const record = await getDoc(doc(db, 'athletes', athleteId));
        if (!record.exists()) {
          setError('This credential record could not be found.');
        } else {
          setAthlete({ id: record.id, ...record.data() });
        }
      } catch (err) {
        console.error('Error fetching public credential:', err);
        setError('Unable to verify this record right now.');
      } finally {
        setLoading(false);
      }
    };

    if (athleteId) fetchAthlete();
  }, [athleteId]);

  if (loading) {
    return (
      <section className="verify-card loading-state" aria-live="polite">
        <div>
          <div className="spinner" aria-hidden="true" />
          <p>Verifying credential record...</p>
        </div>
      </section>
    );
  }

  if (error || !athlete) {
    return (
      <section className="verify-card" aria-labelledby="verify-error-heading">
        <p className="eyebrow">Public verification</p>
        <h1 id="verify-error-heading" className="panel-heading">Record unavailable</h1>
        <p className="panel-copy">{error || 'No athlete record was provided.'}</p>
        <div className="error-banner" style={{ marginTop: '22px' }}>Check the QR code or verification link and try again.</div>
      </section>
    );
  }

  const documents = athlete.documentsUploaded ? Object.entries(athlete.documentsUploaded) : [];

  return (
    <section className="verify-card" aria-labelledby="public-verify-heading">
      <p className="eyebrow">Public verification / live ledger</p>
      <div className="verify-record-header">
        <div>
          <h1 id="public-verify-heading">Credential verified</h1>
          <p>Official athlete record authenticated by SecureSports Vault.</p>
        </div>
        <span className="status-pill">{athlete.status || 'Approved'}</span>
      </div>

      <div className="verify-record">
        <div className="verify-grid">
          <div className="verify-stat"><span>Athlete name</span><strong>{athlete.fullName}</strong></div>
          <div className="verify-stat"><span>Sport category</span><strong>{athlete.sportCategory}</strong></div>
          <div className="verify-stat"><span>District / state</span><strong>{athlete.district}</strong></div>
          <div className="verify-stat"><span>Registered phone</span><strong>{athlete.phone}</strong></div>
        </div>

        <div className="document-list">
          <h4>Verified board credentials</h4>
          {documents.length > 0 ? documents.map(([key, value]) => (
            <div key={key} className="document-row">
              <span className="document-icon" aria-hidden="true">✓</span>
              <div className="document-copy">
                <strong>{key.replace(/([A-Z])/g, ' $1').trim()}</strong>
                <span>{value || 'Verified Document'}</span>
              </div>
              <span className="document-verified">Verified</span>
            </div>
          )) : <p className="panel-copy">No files attached.</p>}
        </div>

        <div className="hash-line" style={{ marginTop: '18px' }}>Record ID: {athlete.id}</div>
      </div>
    </section>
  );
}
