import { useCallback, useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import AddAthlete from './AddAthlete';

export default function OrganizerDashboard({ organizerId }) {
  const [activeTab, setActiveTab] = useState('list');
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAthletes = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'athletes'), where('organizerId', '==', organizerId));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAthletes(list);
    } catch (err) {
      console.error('Error fetching athletes:', err);
    } finally {
      setLoading(false);
    }
  }, [organizerId]);

  useEffect(() => {
    const timer = window.setTimeout(() => fetchAthletes(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchAthletes]);

  return (
    <section className="dashboard-card" aria-labelledby="organizer-dashboard-heading">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Organizer command center</p>
          <h2 id="organizer-dashboard-heading" className="panel-heading">Credential operations</h2>
          <p className="panel-copy">Manage, verify, and issue approved athlete records from one secure ledger.</p>
        </div>

        <div className="dashboard-tabs" role="tablist" aria-label="Organizer records">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'list'}
            onClick={() => setActiveTab('list')}
            className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
          >
            DIRECTORY ({athletes.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'add'}
            onClick={() => setActiveTab('add')}
            className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
          >
            + UPLOAD ATHLETE
          </button>
        </div>
      </div>

      {activeTab === 'add' ? (
        <div className="dashboard-content">
          <AddAthlete
            organizerId={organizerId}
            onAthleteAdded={() => {
              fetchAthletes();
              setActiveTab('list');
            }}
          />
        </div>
      ) : (
        <div className="dashboard-content">
          <div className="metric-strip" aria-label="Directory metrics">
            <div className="metric-card">
              <span className="metric-label">Registered athletes</span>
              <strong className="metric-value accent">{athletes.length.toString().padStart(2, '0')}</strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">Ledger status</span>
              <strong className="metric-value">LIVE</strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">Approval layer</span>
              <strong className="metric-value">BOARD</strong>
            </div>
          </div>

          <div className="content-toolbar">
            <div>
              <h3>Authorized athlete vault</h3>
              <p>Live ledger of board-approved sport participants.</p>
            </div>
            <button type="button" onClick={fetchAthletes} className="ghost-button">
              Refresh ledger
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div>
                <div className="spinner" aria-hidden="true" />
                <p>Decrypting secure records...</p>
              </div>
            </div>
          ) : athletes.length === 0 ? (
            <div className="empty-state">
              <div>
                <div className="empty-icon" aria-hidden="true">+</div>
                <strong>No athlete profiles registered yet</strong>
                <p>Your directory is ready for its first approved record.</p>
                <button type="button" onClick={() => setActiveTab('add')} className="text-button inline-link">
                  Upload your first athlete record
                </button>
              </div>
            </div>
          ) : (
            <div className="table-shell">
              <div className="table-scroll">
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Sport</th>
                      <th>Phone</th>
                      <th>District</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {athletes.map((item) => (
                      <tr key={item.id}>
                        <td className="name-cell"><span className="row-dot" aria-hidden="true" />{item.fullName}</td>
                        <td className="sport-cell">{item.sportCategory}</td>
                        <td className="mono-cell">{item.phone}</td>
                        <td>{item.district}</td>
                        <td><span className="status-pill">{item.status || 'Approved'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
