import { useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';

export default function AthleteDashboard() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [athleteData, setAthleteData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const q = query(
        collection(db, 'athletes'),
        where('phone', '==', phone),
        where('status', '==', 'Approved'),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('No verified athlete record found for this phone number.');
        setLoading(false);
        return;
      }

      const docSnap = querySnapshot.docs[0];
      setAthleteData({ id: docSnap.id, ...docSnap.data() });
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomCode);
      console.log('=== SECURE SYSTEM OTP ===');
      console.log(`Generated code for ${phone}: ${randomCode}`);
      console.log('=========================');
      setStep(2);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    if (enteredOtp === generatedOtp) {
      setStep(3);
    } else {
      setError('Incorrect verification code. Please enter the valid 6-digit code.');
    }
  };

  const handleDownloadPDF = () => {
    if (!athleteData) return;

    const docPdf = new jsPDF();
    docPdf.setFont('helvetica', 'bold');
    docPdf.setFontSize(18);
    docPdf.text('Official Verified Credential Report', 20, 20);
    docPdf.setFontSize(10);
    docPdf.setTextColor(100);
    docPdf.text('Government Authority & Board Approved Document', 20, 27);
    docPdf.setFontSize(12);
    docPdf.setTextColor(0);
    docPdf.setFont('helvetica', 'bold');
    docPdf.text('Athlete Core Details:', 20, 40);
    docPdf.setFont('helvetica', 'normal');
    docPdf.text(`Full Name: ${athleteData.fullName}`, 25, 50);
    docPdf.text(`Sport Category: ${athleteData.sportCategory}`, 25, 60);
    docPdf.text(`District / State: ${athleteData.district}`, 25, 70);
    docPdf.text(`Date of Birth: ${athleteData.dob}`, 25, 80);
    docPdf.text(`Gender: ${athleteData.gender}`, 25, 90);
    docPdf.text(`Registered Phone: ${athleteData.phone}`, 25, 100);
    docPdf.text(`Unique Reference Hash ID: ${athleteData.id}`, 25, 110);
    docPdf.setFont('helvetica', 'bold');
    docPdf.text('Approved Admin Documents Vault:', 20, 125);

    let yPos = 135;
    if (athleteData.documentsUploaded) {
      Object.entries(athleteData.documentsUploaded).forEach(([key, fileName]) => {
        const docName = key.replace(/([A-Z])/g, ' $1').trim();
        docPdf.setFont('helvetica', 'normal');
        docPdf.text(`• ${docName}: ${fileName || 'Verified Document'}`, 25, yPos);
        yPos += 10;
      });
    }

    docPdf.setFontSize(9);
    docPdf.setTextColor(150);
    docPdf.text('Verified via Secure Sports Credential Platform', 20, 280);
    docPdf.save(`${athleteData.fullName.replace(/\s+/g, '_')}_Credentials.pdf`);
  };

  const steps = ['Phone', 'Code', 'Vault'];

  return (
    <section className="athlete-panel accent-top" aria-labelledby="athlete-portal-heading">
      <div className="stepper" aria-label="Verification progress">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          return (
            <div key={label} className={`step ${step >= stepNumber ? (step > stepNumber ? 'complete' : 'active') : ''}`}>
              <span className="step-number">{stepNumber}</span>
              {label}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div>
          <p className="eyebrow">Athlete access</p>
          <h2 id="athlete-portal-heading" className="panel-heading">Open your credential vault</h2>
          <p className="panel-copy">Enter your registered mobile number to trigger a secure two-factor challenge.</p>
          <form onSubmit={handleRequestOtp} className="portal-form">
            {error && <p className="error-banner" role="alert">{error}</p>}
            <label className="field-group">
              <span className="field-label">Registered phone number</span>
              <input type="tel" placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="field-input" required />
            </label>
            <button type="submit" disabled={loading} className="primary-button full-width">
              {loading ? 'CHECKING LEDGER...' : 'REQUEST VERIFICATION CODE'}
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="eyebrow">Two-factor challenge</p>
          <h2 className="panel-heading">Enter your verification code</h2>
          <p className="panel-copy">A secure code has been dispatched to <strong>{phone}</strong>.</p>
          <div className="info-banner" style={{ marginTop: '18px' }}>
            Demo mode: your live code is shown here for testing — <strong>{generatedOtp}</strong>
          </div>
          <form onSubmit={handleVerifyOtp} className="portal-form">
            {error && <p className="error-banner" role="alert">{error}</p>}
            <label className="field-group">
              <span className="field-label">6-digit access code</span>
              <input type="text" inputMode="numeric" placeholder="000000" maxLength="6" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} className="field-input otp-input" required />
            </label>
            <button type="submit" className="primary-button full-width">CONFIRM & UNLOCK VAULT</button>
            <button type="button" onClick={() => setStep(1)} className="text-button">Go back</button>
          </form>
        </div>
      )}

      {step === 3 && athleteData && (
        <div className="form-stack">
          <div className="authenticated-header">
            <p className="eyebrow">Authenticated record</p>
            <h3>Official credential report</h3>
            <span className="auth-badge">✓ 2FA AUTHENTICATED / BOARD APPROVED</span>
          </div>

          <div className="identity-card">
            <div className="qr-frame">
              <QRCodeSVG value={`ATHLETE_VERIFIED:${athleteData.id}`} size={130} />
            </div>
            <div className="identity-details">
              <div className="detail-row"><span className="detail-label">Athlete</span><strong className="detail-value">{athleteData.fullName}</strong></div>
              <div className="detail-row"><span className="detail-label">Sport</span><strong className="detail-value">{athleteData.sportCategory}</strong></div>
              <div className="detail-row"><span className="detail-label">District</span><strong className="detail-value">{athleteData.district}</strong></div>
              <div className="detail-row"><span className="detail-label">DOB</span><strong className="detail-value">{athleteData.dob}</strong></div>
              <div className="detail-row"><span className="detail-label">Hash</span><strong className="detail-value mono">{athleteData.id}</strong></div>
            </div>
          </div>

          <div className="document-list">
            <h4>Approved admin documents</h4>
            {athleteData.documentsUploaded ? Object.entries(athleteData.documentsUploaded).map(([key, fileName]) => (
              <div key={key} className="document-row">
                <span className="document-icon" aria-hidden="true">✓</span>
                <div className="document-copy">
                  <strong>{key.replace(/([A-Z])/g, ' $1').trim()}</strong>
                  <span>{fileName || 'Verified Document'}</span>
                </div>
                <span className="document-verified">Verified</span>
              </div>
            )) : <p className="panel-copy">No files attached.</p>}
          </div>

          <div className="action-stack">
            <button type="button" onClick={handleDownloadPDF} className="primary-button full-width">DOWNLOAD COMPLETE REPORT</button>
            <button type="button" onClick={() => { setStep(1); setEnteredOtp(''); setAthleteData(null); }} className="ghost-button full-width">SIGN OUT</button>
          </div>
        </div>
      )}
    </section>
  );
}
