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

async function checkOffices() {
  const snapshot = await getDocs(collection(db, 'offices'));
  const offices = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log("Total offices in DB:", offices.length);
  offices.forEach(o => {
    console.log(`- ${o.name} | Status: ${o.status || 'undefined'} | Views: ${o.views || 0}`);
  });
}

checkOffices();
