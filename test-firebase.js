import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkH8K2_ZB-sfMhv84jwzMULRHPMifBucI",
  authDomain: "servess-90d15.firebaseapp.com",
  projectId: "servess-90d15",
  storageBucket: "servess-90d15.firebasestorage.app",
  messagingSenderId: "791204209191",
  appId: "1:791204209191:web:0814c10864f26a9ef86402"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

import { deleteDoc, doc } from "firebase/firestore";

async function clearMockData() {
  try {
    console.log("Deleting mock data from Firestore...");
    
    // Delete Mock Ads
    for (let i = 1; i <= 5; i++) {
      const adId = `ad-${i}`;
      await deleteDoc(doc(db, 'ads', adId));
      console.log(`Deleted ad: ${adId}`);
    }

    // Delete Mock Offices
    for (let i = 1; i <= 5; i++) {
      const officeId = `off-${i}`;
      await deleteDoc(doc(db, 'offices', officeId));
      console.log(`Deleted office: ${officeId}`);
    }

    console.log("All mock data deleted successfully!");
  } catch (err) {
    console.error("Firebase deletion error:", err);
  }
}

clearMockData();
