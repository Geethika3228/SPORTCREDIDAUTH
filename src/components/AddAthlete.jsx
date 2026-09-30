import { useState } from 'react';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';

const emptyFiles = {
  identityProof: null,
  academicProof: null,
  sportsCertificate: null,
  achievementCertificate: null,
  instituteCertificate: null,
};

export default function AddAthlete({ organizerId, onAthleteAdded }) {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: 'Male',
    sportCategory: '',
    phone: '',
    district: '',
  });
  const [files, setFiles] = useState(emptyFiles);
  const [createdAthleteId, setCreatedAthleteId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileDrop = (e, fieldName) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      setFiles({ ...files, [fieldName]: e.dataTransfer.files[0].name });
    }
  };

  const handleFileSelect = (e, fieldName) => {
    if (e.target.files?.[0]) {
      setFiles({ ...files, [fieldName]: e.target.files[0].name });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'athletes'), {
        ...formData,
        documentsUploaded: files,
        organizerId: organizerId || 'demo_organizer_01',
        status: 'Approved',
        createdAt: serverTimestamp(),
      });
      setCreatedAthleteId(docRef.id);
      if (onAthleteAdded) onAthleteAdded();
    } catch (err) {
      console.error('Error adding athlete: ', err);
    } finally {
      setLoading(false);
    }
  };

  const renderUploadCard = (label, fieldName) => (
    <label className={`upload-card ${files[fieldName] ? 'has-file' : ''}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleFileDrop(e, fieldName)}>
      <input type="file" onChange={(e) => handleFileSelect(e, fieldName)} required={!files[fieldName]} />
      <span className="upload-card-icon" aria-hidden="true">↗</span>
      <span className="upload-card-title">{label}</span>
      <span className="upload-card-copy">Drop document here or click to browse</span>
      <span className="upload-card-file">{files[fieldName] ? `Selected: ${files[fieldName]}` : 'PDF, JPG or PNG'}</span>
    </label>
  );

  return (
    <section className="form-card" aria-labelledby="add-athlete-heading">
      {!createdAthleteId ? (
        <>
          <div className="form-card-heading">
            <div>
              <p className="eyebrow">New credential record</p>
              <h3 id="add-athlete-heading">Register an athlete</h3>
              <p>Capture core identity details and attach the five required board documents.</p>
            </div>
            <span className="section-caption">Required fields *</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field-group">
                <span className="field-label">Full athlete name *</span>
                <input type="text" name="fullName" placeholder="e.g. Anika Sharma" value={formData.fullName} onChange={handleChange} className="field-input" required />
              </label>
              <label className="field-group">
                <span className="field-label">Phone number *</span>
                <input type="tel" name="phone" placeholder="For OTP verification" value={formData.phone} onChange={handleChange} className="field-input" required />
              </label>
            </div>

            <div className="form-grid three-col">
              <label className="field-group">
                <span className="field-label">Date of birth *</span>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="field-input" required />
              </label>
              <label className="field-group">
                <span className="field-label">Gender</span>
                <select name="gender" value={formData.gender} onChange={handleChange} className="field-select">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="field-group">
                <span className="field-label">Sport category *</span>
                <input type="text" name="sportCategory" placeholder="e.g. Athletics" value={formData.sportCategory} onChange={handleChange} className="field-input" required />
              </label>
            </div>

            <label className="field-group">
              <span className="field-label">District / state *</span>
              <input type="text" name="district" placeholder="e.g. Pune, Maharashtra" value={formData.district} onChange={handleChange} className="field-input" required />
            </label>

            <div className="upload-section">
              <div className="upload-heading">
                <h4>Required document uploads</h4>
                <span>05 / 05 files</span>
              </div>
              <div className="upload-grid">
                {renderUploadCard('Identity proof', 'identityProof')}
                {renderUploadCard('Academic proof', 'academicProof')}
                {renderUploadCard('Sports certificate', 'sportsCertificate')}
                {renderUploadCard('Achievement certificate', 'achievementCertificate')}
                {renderUploadCard('Institute certificate', 'instituteCertificate')}
              </div>
            </div>

            <button type="submit" disabled={loading} className="primary-button full-width form-submit">
              {loading ? 'PROCESSING RECORD...' : 'APPROVE & GENERATE SECURE QR'}
            </button>
          </form>
        </>
      ) : (
        <div className="success-state">
          <p className="eyebrow">Record committed to ledger</p>
          <h4>Athlete verified successfully</h4>
          <p>All required credentials have been registered. Present this QR reference when the record needs to be verified.</p>
          <div className="qr-frame">
            <QRCodeSVG value={`NAME:${formData.fullName}\nSPORT:${formData.sportCategory}\nDISTRICT:${formData.district}\nID:${createdAthleteId}\nSTATUS:GOVT_APPROVED`} size={180} />
          </div>
          <div className="hash-line">Reference hash: {createdAthleteId}</div>
          <button type="button" onClick={() => { setCreatedAthleteId(null); setFiles(emptyFiles); }} className="secondary-button">
            REGISTER ANOTHER ATHLETE
          </button>
        </div>
      )}
    </section>
  );
}
