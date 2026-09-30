import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA0uDYQooq6z2M3Pkgn74PvCmv3HhA1Yxk',
  authDomain: 'sportscredid-prod.firebaseapp.com',
  projectId: 'sportscredid-prod',
  storageBucket: 'sportscredid-prod.firebasestorage.app',
  messagingSenderId: '552879925919',
  appId: '1:552879925919:web:601359a842c61e1e4b90aa',
  measurementId: 'G-V596LV52Z9',
};

const app = initializeApp(firebaseConfig);

// Analytics is optional and may be unavailable in some browsers or preview contexts.
isSupported().then((supported) => {
  if (supported) getAnalytics(app);
}).catch(() => {
  // Keep the app usable when analytics is blocked or unavailable.
});

export const auth = getAuth(app);
export const db = getFirestore(app);
